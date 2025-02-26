import {readFile} from 'node:fs/promises';
import {appendFile} from 'node:fs/promises';
import {parse} from 'csv-parse';

/**
 * 
 * @param {*} sourceFile 
 * @returns 
 */
export function AirBnBDataHandler(sourceFile) {
    let me = {};

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

    function read() {
        const readData = readFile(sourceFile, { encoding: 'utf8' })
        .then(parseCSV)
        .catch((error) => {
            console.error(`Could not read file: ${error}`);
            throw error;
        })
        return {...this, data: readData};
    }

    function filterListings(filters) {
        const filterData = this.data.then(listings => {
            return listings.filter(l => {
                return (!filters.minPrice || Number(l.price) >= filters.minPrice) 
                    && (!filters.maxPrice || Number(l.price) <= filters.maxPrice)
                    && (!filters.minRooms || Number(l.bedrooms) >= filters.minRooms) 
                    && (!filters.maxRooms || Number(l.bedrooms) <= filters.maxRooms)
                    && (!filters.minRate || Number(l.review_scores_rating) >= filters.minRate)
            });
            // console.log(r1[0]);
        });
        return {...this, data: filterData};
    }

    function getCount(filteredList) {
        return filteredList.length;
    }

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

    function computeCategory (inputObj, fn){
        const result = {};
        for (let key in inputObj) {
            result[key] = fn(inputObj[key]);
        }
        return result;
    }

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


    function categorizeAccomodates (dataList) {
        const listsPerAccomodate = dataList.reduce((accumulator, current) => {
            if (!accumulator[Number(current.accommodates)]) {
                accumulator[Number(current.accommodates)] = [];
            }
            accumulator[Number(current.accommodates)] = [...accumulator[Number(current.accommodates)], current];
            return accumulator;
        }, {});
        return {
            getListsPerHostID: () => listsPerAccomodate,
        };
    }

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


// let test = AirBnBDataHandler("./listings.csv");
// // console.log(test);
// let data = test.read();
// // console.log(data);
// const filters = {minPrice:undefined, maxPrice:undefined, minRooms:1, maxRooms:2, minRate:5};
// // const filters = {minPrice:undefined, maxPrice:undefined, minRooms:undefined, maxRooms:undefined, minRate:undefined};
// let filterdata = data.filter(filters);
// // console.log(filterdata);
// let s = filterdata.statistic();
// // console.log(s);
// let h = filterdata.hosts();
// let k = data.statistic();
// k.export("Statistics");
// // s.export("Statistics").then(()=>h.export("Ranking"));