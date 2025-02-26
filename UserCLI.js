import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { AirBnBDataHandler } from "./AirBnBDataHandler.js";

export async function UserCLI (sourceFile) {
    if (typeof(sourceFile) !== "string" || sourceFile.slice(-4) !== ".csv"){
        throw new error ("Error: Invalid .csv file path");
    }

    const data = AirBnBDataHandler(sourceFile).read();
    const rl = readline.createInterface({ input, output });
    console.log("Welcome to the Airbnb Data Handler!");;
    const re1 = await inquiryForOp("* Do you want to filter the listings? (based on price, rooms, review scores) [y/Y/n/N]: ",inquiryForFilter);
    const re2 = await inquiryForOp("* Do you want to compute statistics? (count of listings that fall into the filter, average price per number of rooms) [y/Y/n/N]: ", inquiryForStatistics);
    const re3 = await inquiryForOp("* Do you want to get hosts ranking? (a ranking by number of listings) [y/Y/n/N]: ", inquiryForHosts);
    const re4 = await inquiryForOp("* Do you want to get listings per accommodates? [y/Y/n/N]:", inquiryForAccommodates);
    if (re1 || re3 || re4) {
        await inquiryForExport(re2, re3, re4);
    }
    rl.close();


    async function inquiryForOp (question, fn) {
        function checkAns(input) {
            if (!input || input.length === 0 || input === "n" || input === "N") {
                return 0;
            } else if (input === "y" || input === "Y") {
                return 1;
            } else {
                return -1;
            }
        }

        const answer = await rl.question(question);
        switch (checkAns(answer)) {
            case 0: 
                return;
            case 1: 
                return await fn();
            case -1: 
                console.log("Invalid input. please input: y/Y/n/N");
                return await inquiryForOp(question, fn);
        }
    }

    async function inquiryForFilter () {
        async function inquiry (question) {
            function checkInput(input) {
                if (input.length === 0) {
                    return;
                }
                if (isNaN(Number(input))){
                    return inquiry(question);
                }
                return Number(input);
            }

            const answer = await rl.question(question);
            return checkInput(answer);
        }

        console.log("Please provide numbers for the following questions. You may enter directly if you do not want to set a specific criteria,");
        const filters = {minPrice: await inquiry('** Please enter the Minimum Price for filter: '),  
                        maxPrice: await inquiry('** Please enter the Maximum Price for filter: '),
                        minRooms: await inquiry('** Please enter the Minimum Number of Bedrooms for filter: '),
                        maxRooms: await inquiry('** Please enter the Maximum Number of Bedrooms for filter: '),
                        minRate: await inquiry('** Please enter the Minimum Scores of Review for filter: '),
        
        }
        return data.filter(filters);
        console.log("Thank you. Data has been filtered\n");
    }

    function inquiryForStatistics () {
        if (re1) {
            return re1.statistic();
        } else {
            return data.statistic();
        }
    }

    function inquiryForHosts () {
        if (re1) {
            return re1.hosts();
        } else {
            return data.hosts();
        }
    }

    function inquiryForAccommodates () {
        if (re1) {
            return re1.accommodates();
        } else {
            return data.accommodates();
        }
    }


    // async function inquiryForExport (r2, r3) {
    //     const answer = await rl.question("* Please provide a file name to store results: ");
    //     if (r2) {
    //         if (r3) {
    //             r2.export("Statistics", answer)
    //             .then(()=>r3.export("Host Ranking", answer));
    //         } else {
    //             r2.export("Statistics: ", answer)
    //         }
    //     }
    // }

    async function inquiryForExport (r2, r3, r4) {
        const answer = await rl.question("* Please provide a file name to store results: ");
        if (r2) {
            if (r3) {
                if (r4) {
                    r2.export("Statistics", answer)
                    .then(()=>r3.export("Host Ranking", answer))
                    .then(()=>r4.export("Accommodates Lists", answer));
                } else {
                    r2.export("Statistics", answer)
                    .then(()=>r3.export("Host Ranking", answer));
                }
            } else {
                if (r4) {
                    r2.export("Statistics", answer)
                    .then(()=>r4.export("Accommodates Lists", answer));
                } else {
                    r2.export("Statistics", answer);
                }
            }
        }
    }

}