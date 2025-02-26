import {readFile} from 'node:fs/promises';
import {appendFile} from 'node:fs/promises';
import {parse} from 'csv-parse';

/**
 * A handler that interacts with file.
 * - implements methods chaining and build pattern
 * @module AirBnBDataHandler
 * @param {string} sourceFile 
 * @returns {Object} {read: {fn}, filter: {fn}, export: {fn}, statistic: {fn}, hosts: {fn}, accommodates: {fn}, data: {Promise}}
 */
export function AirBnBDataHandler(sourceFile) {
    let me = {};

    /**
     * Parse the string content from a CSV file
     * @memberof module:AirBnBDataHandler
     * @param {string} content 
     * @returns {Promise} a Promise with data from csv-parse.parse()
     */
    function parseCSV(content) {
        return new Promise((resolve, reject) => {
            parse(content, {
                columns: true,
                trim: true,
                skip_empty_lines: true
            }, (err, records) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(records);
                }
            });
        });
    }

    /**
     * Read csv file using node:fs/promisess
     * @memberof module:AirBnBDataHandler
     * @returns {Object} {read: {fn}, filter: {fn}, export: {fn}, statistic: {fn}, hosts: {fn}, accommodates: {fn}, data: {Promise}}
     */
    function read() {
        const readData = readFile(sourceFile, { encoding: 'utf8' })
        .then(parseCSV)
        .catch((error) => {
            console.error(`Could not read file: ${error}`);
            throw error;
        })
        return {...this, data: readData};
    }

    /**
     * Filter based on price, bedrooms, review rate
     * @memberof module:AirBnBDataHandler
     * @param {Object} filters 
     * @returns {Object} {read: {fn}, filter: {fn}, export: {fn}, statistic: {fn}, hosts: {fn}, accommodates: {fn}, data: {Promise}}
     */
    function filterListings(filters) {
        const filterData = this.data.then(listings => {
            return listings.filter(l => {
                return (!filters.minPrice || parseFloat(l.price.slice(1).replace(/,/g, '')) >= filters.minPrice) 
                    && (!filters.maxPrice || parseFloat(l.price.slice(1).replace(/,/g, '')) <= filters.maxPrice)
                    && (!filters.minRooms || Number(l.bedrooms) >= filters.minRooms) 
                    && (!filters.maxRooms || Number(l.bedrooms) <= filters.maxRooms)
                    && (!filters.minRate || Number(l.review_scores_rating) >= filters.minRate)
            });
            // console.log(r1[0]);
        });
        return {...this, data: filterData};
    }

    /**
     * Count the number of elements in an array
     * @memberof module:AirBnBDataHandler
     * @param {Array<Object>} filteredList 
     * @returns {number}
     */
    function getCount(filteredList) {
        return filteredList.length;
    }

    /**
     * Categorize number of bedrooms with their listings
     * @memberof module:AirBnBDataHandler
     * @param {Array<Object>} filteredList 
     * @returns {Object} {"bedroom number": array of listings, ...} 
     */
    // Categorize number per Rooms with their corresponding lists using Array.reduce()
    function categorizeRooms (filteredList) {
        const listsPerRooms = filteredList.reduce((accumulator, current) => {
                if (!accumulator[Number(current.bedrooms)]) {
                    accumulator[Number(current.bedrooms)] = [];
                }
                accumulator[Number(current.bedrooms)] = [...accumulator[Number(current.bedrooms)], current];
                return accumulator;
            }, {});

        return {
            getRooms: () => listsPerRooms
        };
    }

    /**
     * Calculate the average price for a given array of listings
     * @memberof module:AirBnBDataHandler
     * @param {Array<Object>} roomsList 
     * @returns {number}
     */
    // Calculate average price for a list 
    function avgPrice(roomsList) {
        if (roomsList.length === 0) {
            return 0;
        }
        const total = roomsList.reduce((acc, current) => {
            if (!current.price || current.price.length === 0) {
                return acc;
            } else {
                return (acc + parseFloat(current.price.slice(1).replace(/,/g, ''))); // remove $ and comma, converted to number
            }
        }, 0);
        // console.log(total);
        return total / roomsList.length;
    }

    /**
     * A high order function that accepts an Object and a function, returning a new Object with key from input Object and value from the return of function applied to the value from input Object
     * @memberof module:AirBnBDataHandler
     * @param {Object} inputObj 
     * @param {function} fn 
     * @returns {Object} 
     */
    function computeCategory (inputObj, fn){
        const result = {};
        for (let key in inputObj) {
            result[key] = fn(inputObj[key]);
        }
        return result;
    }

    /**
     * Compute statistics result: total lisitings and average price per number of bedrooms
     * @memberof module:AirBnBDataHandler
     * @returns {Object} {read: {fn}, filter: {fn}, export: {fn}, statistic: {fn}, hosts: {fn}, accommodates: {fn}, data: {Promise}}
     */
    function computeStatis() {
        const statisData = this.data.then(listings => {
            const cnt = getCount(listings);
            const rooms = categorizeRooms(listings).getRooms();
            const avgPricePerRooms = computeCategory(rooms, avgPrice);
            // console.log(cnt);
            // console.log(rooms[1].price);
            // console.log(avgPricePerRooms);
            return {TotalListings: cnt, AvgPricePerRooms: avgPricePerRooms};
        });
        return {...this, data: statisData};
    }

    /**
     * Categorize hosts with their listings
     * @memberof module:AirBnBDataHandler
     * @param {Array<Object>} dataList 
     * @returns {Object} {host id: Array of listings of this host, ...}
     */
    function categorizeHosts (dataList) {
        const listsPerHost = dataList.reduce((accumulator, current) => {
            if (!accumulator[current.host_id]) {
                accumulator[current.host_id] = [];
            }
            accumulator[current.host_id] = [...accumulator[current.host_id], current];
            return accumulator;
        }, {});
        return {
            getListsPerHostID: () => listsPerHost,
        };
    }

    /**
     * Sort all the hosts with different number of listings
     * @memberof module:AirBnBDataHandler
     * @param {Object} inputObj {host id: total number of listings, ...}
     * @returns {Array} [[host id, total number of listings], ...] (sorted, highest number of listings in the front)
     */
    function ranking(inputObj) {
        return Object.entries(inputObj).sort((a, b) => {
            if(a[1] < b[1]) {
                return 1;
            } else if (a[1] > b[1]) {
                return -1;
            } else {
                return 0;
            }
        });
    }

    /**
     * A function that compute hosts info by calling categorizeHosts, getCount, ranking functions
     * @memberof module:AirBnBDataHandler
     * @returns {Object} {read: {fn}, filter: {fn}, export: {fn}, statistic: {fn}, hosts: {fn}, accommodates: {fn}, data: {Promise}}
     */
    function computeHosts() {
        const statisData = this.data.then(listings => {
            const hosts = categorizeHosts(listings).getListsPerHostID();
            // const ranks = ranking(hosts);
            const hosts_cnt = computeCategory(hosts, getCount);
            const ranks = ranking(hosts_cnt);
            // console.log(hosts_cnt);
            // console.log(ranks);
            return ranks;
        });
        return {...this, data: statisData};
    }

    /**
     * Categorize list ids per accomodates
     * - Additional creative function
     * @memberof module:AirBnBDataHandler
     * @returns {Object} {read: {fn}, filter: {fn}, export: {fn}, statistic: {fn}, hosts: {fn}, accommodates: {fn}, data: {Promise}}
     */
    function computeAccomodates () {
        const statisData = this.data.then(listings => 
            listings.reduce((accumulator, current) => {
                if (!accumulator[Number(current.accommodates)]) {
                    accumulator[Number(current.accommodates)] = [];
                }
                accumulator[Number(current.accommodates)] = [...accumulator[Number(current.accommodates)], Number(current.id)];
                return accumulator;
            }, {}));
        return {...this, data: statisData};
    }

    /**
     * Export data in the obect to an output file
     * @memberof module:AirBnBDataHandler
     * @param {string} title 
     * @param {string} outputFile 
     * @returns {void} nothing
     */
    async function exportToFile(title, outputFile = "./.tempresult") {
        return appendFile(outputFile, `${title}:\n`)
            .then(()=> this.data)
            .then(result => appendFile(outputFile, JSON.stringify(result)))
            .then(()=> appendFile(outputFile, "\n\n"))
            .then(() => console.log(`Data has been written to ${outputFile}`))
            .catch((error) => {
                console.log(`Data write FAILED!`);
            })
    }

    me.read = read;
    me.filter = filterListings;
    me.export = exportToFile;
    me.statistic = computeStatis;
    me.hosts = computeHosts;
    me.accommodates = computeAccomodates;
    me.data = Promise.resolve([]);
    return me;
}