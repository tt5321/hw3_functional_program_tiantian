# hw3_functional_program_tiantian

## Setting up

1. Download the zip file and unzip 
2. Install modules
``` 
npm install
```
3. To start running the program:
```bash
npm start
```

## Author:
Tiantian Ma

## Implementation
### Code
- AirBnbDataHandler.js
- UserCLI.js
- index.js
### Documentation
- README.md
- out/ (JSDoc htmls)

## Creative Feature
- Feature: Get the listing IDs per accomodates in the filtered result. It is integrated in the interactive CLI and has a question for use to decide if he/she wants to calculate this.
    - Implementation:
        - UserCLI.js: 
        ```
            const re4 = await inquiryForOp("* Do you want to get listings per accommodates? [y/Y/n/N]:", inquiryForAccommodates);
        ```
        - AirBnBDataHandler.js:
        ```
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
        ```

## Principle Examples
### Pure Function
Code example:
AirBnBDataHandler.js: 
```
/* This function does not modify inputObj, and returns a new array. It always produces the same result with the same   input. Also, it has no side effect (doeas not change external state).*/
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
```
Counter example:
```
// This counter example modifies the external array
    let result = [];
    function ranking(inputObj) {
        result = Object.entries(inputObj).sort((a, b) => {
            if(a[1] < b[1]) {
                return 1;
            } else if (a[1] > b[1]) {
                return -1;
            } else {
                return 0;
            }
        });
        return result;
    }
```
### High Order Function
Code example:
AirBnBDataHandler.js: 
```
// It accepts a function as parameter, so that different functions can be applied to the inputObj
    function computeCategory (inputObj, fn){
        const result = {};
        for (let key in inputObj) {
            result[key] = fn(inputObj[key]);
        }
        return result;
    }
// Usage:
    const avgPricePerRooms = computeCategory(rooms, avgPrice);
```
Counter example:
```
// The function does not accept a function as parameter and does not returns a function
    function computeAvgPrice(inputObj){
        const result = {};
        for (let key in inputObj) {
            const roomsList = imputObt[key];
            if (roomsList.length === 0) {
                result[key] = 0;
            } else {
                const total = roomsList.reduce((acc, current) => {
                    if (!current.price || current.price.length === 0) {
                        return acc;
                    } else {
                        return (acc + parseFloat(current.price.slice(1).replace(/,/g, ''))); // remove $ and comma, converted to number
                    }
                }, 0);
                result[key] = total / roomsList.length;
            }
        }
    }
```

## Description of Project
- Understood the assignment by highlighting keywords
- Reviewed functional programming concepts
- Built the AirBnBDataHandler.js
    - Understood the structures of .csv file
    - Figured out how to read and parse .csv file by reading

## Video
Youtube Link: https://youtu.be/OLjf6rXqwd8

## How this project was created
1. Understood the assignment by highlighting krywords
2. Review functional programming concepts
3. Analyzed how to parse .csv file
    - Read the .csv file
    - Learned and tested 'node:fs/promises' to read file (with help from ChatGPT on debug and explanation)
    - Learned and tested papaparse, csv-parser modules to parse the csv file
4. Wrote the other features in AirBNBDataHandler.js
5. Combined all the features in AirBNBDataHandler.js with method chaining implementation (with help from ChatGPT on how to combine)
6. Wrote UserCLI.js
7. Wrote the creative function

## Tools used
1. ChatGPT (version: ChatGpt-4o)
2. Reference:
    - https://csv.js.org/parse/api/callback/
    - https://nodejs.org/dist/latest-v10.x/docs/api/fs.html
    - https://nodejs.org/api/readline.html#readline

## Learned
- Better understanding of Promises and async/await
- Practiced on writing pure functions, high order functions
    - Method chaining with pure functions: every time returned a new object copied from the old one with new odifications

## Debug process
- Usually, I used console.log() to figure where the problem originates, then modified code
- For very difficult question, I will copied the code blocks to ChatGPT and asked if there were any issues

## Use of LLM
1. To get started with the file handling with CSV file
** 1st attempt (not very helpful) **
- Prompt: Please provide a guideline for using JavaScript Promise to handle a airbnb csv file? (MJS)
- Response:
```
 Here’s a structured guideline on how to use JavaScript **Promise** to handle an Airbnb CSV file using **ES module (`.mjs`) format**. This guide will walk you through:

1. **Reading the CSV File** asynchronously using `fs.promises`.
2. **Parsing the CSV Data** using `csv-parser` or `papaparse`.
3. **Processing the Data** using Promises.
4. **Handling Errors** effectively.

---

### **1. Install Necessary Packages**

Before starting, install the required Node.js packages:

npm install csv-parser papaparse fs promises


---

### **2. Create an `airbnb_parser.mjs` File**

This script will handle reading and parsing an Airbnb CSV file using **JavaScript Promises**.

// Import necessary modules
import { createReadStream } from 'fs';
import { readFile } from 'fs/promises';
import csv from 'csv-parser';
import Papa from 'papaparse';

// Function to read a CSV file using Promises
const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        let results = [];

        createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

// Function to process the parsed Airbnb data
const processListings = (listings) => {
    return new Promise((resolve) => {
        const filteredListings = listings
            .filter(listing => listing.price && parseFloat(listing.price.replace('$', '')) < 100) // Example: Filter listings under $100
            .map(listing => ({
                id: listing.id,
                name: listing.name,
                price: listing.price,
                location: listing.neighbourhood
            }));

        resolve(filteredListings);
    });
};

// Async function to handle the whole process
const handleAirbnbCSV = async (filePath) => {
    try {
        console.log('Reading CSV file...');
        const data = await readCSV(filePath);

        console.log('Processing Airbnb listings...');
        const processedListings = await processListings(data);

        console.log('Filtered Listings:', processedListings);
    } catch (error) {
        console.error('Error processing CSV:', error);
    }
};

// Call the function with a sample Airbnb CSV file path
const csvFilePath = './airbnb_listings.csv'; // Change this to your file path
handleAirbnbCSV(csvFilePath);


---

### **3. Explanation**

- **Reading the CSV file (`readCSV`)**
    - Uses `fs.createReadStream()` and `csv-parser`.
    - Returns a **Promise** that resolves when the entire CSV file is read.
- **Processing the data (`processListings`)**
    - Filters listings where the price is under `$100`.
    - Extracts relevant details (`id`, `name`, `price`, `location`).
    - Returns a **Promise** to allow further asynchronous processing.
- **Handling the file asynchronously (`handleAirbnbCSV`)**
    - Uses `async/await` to read, process, and handle errors properly.
    - Ensures smooth and readable asynchronous flow.

---

### **4. Alternative Approach: Using `Papaparse` (Read Full File at Once)**

If you prefer reading the file all at once (for small CSV files):

const readCSVWithPapa = async (filePath) => {
    try {
        const fileContent = await readFile(filePath, 'utf8');
        return new Promise((resolve, reject) => {
            const parsed = Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => resolve(results.data),
                error: (error) => reject(error)
            });
        });
    } catch (error) {
        console.error('Error reading file:', error);
    }
};

// Call this instead of readCSV()
readCSVWithPapa(csvFilePath).then(data => console.log('Parsed Data:', data));


---

### **5. Running the Script**

Ensure you are in an ES module-supported environment (Node.js 14+ or `"type": "module"` in `package.json`).

Run:

```
node airbnb_parser.mjs

```

---

### **6. Error Handling & Best Practices**

- **Error Handling:** Use `.catch()` or `try...catch` to handle file read/parsing errors.
- **Performance Optimization:** Stream for large files (`csv-parser` is better for large datasets).
- **Use Async/Await:** Promises make the flow manageable and readable.

This method ensures **asynchronous, efficient, and clean** handling of Airbnb CSV data in **modern JavaScript (`.mjs`)**! 🚀           
```
- Model: ChatGPT-4o
- Use: Test with the following code but it did not work
```
import fs from 'node:fs/promises';

const readCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        let results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

const data = await readCSV(`./listings.csv`);
console.log(data);

//Error:
TypeError: fs.createReadStream is not a function
    at file:///Users/tian/Desktop/jsproject/hw3_functional_program_tiantian/AirBnBDataHandler.js:7:12
    at new Promise (<anonymous>)
    at readCSV (file:///Users/tian/Desktop/jsproject/hw3_functional_program_tiantian/AirBnBDataHandler.js:4:12)
    at file:///Users/tian/Desktop/jsproject/hw3_functional_program_tiantian/AirBnBDataHandler.js:15:20
    at ModuleJob.run (node:internal/modules/esm/module_job:271:25)
    at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:547:26)
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:116:5)

Node.js v22.13.0
```

** 2nd attempt **
- Prompt: 
import fs from 'node:fs/promises';
const data = await fs.readFile('./listings.csv', { encoding: 'utf8' });
how to split lines in data and trasform them into arrays
- Response:
```
You can split the `data` string into lines using `.split('\n')` and then transform each line into an array using `.split(',')` (assuming it's a CSV file with comma-separated values).

Here’s an example:

import fs from 'node:fs/promises';

async function processCSV() {
    try {
        const data = await fs.readFile('./listings.csv', { encoding: 'utf8' });

        // Split into lines
        const lines = data.trim().split('\n');

        // Convert each line into an array
        const records = lines.map(line => line.split(','));

        console.log(records); // Output an array of arrays
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

processCSV();

### Explanation:
1. `data.trim().split('\n')`: Removes any extra spaces and splits the file into lines.
2. `.map(line => line.split(','))`: Splits each line into an array based on commas.
3. Handles errors gracefully with `try...catch`.

### Notes:
- If the CSV contains values enclosed in quotes or has commas inside quoted fields, you might need a proper CSV parser like [`papaparse`](https://www.npmjs.com/package/papaparse) or [`csv-parser`](https://www.npmjs.com/package/csv-parser).
- If the file uses `\r\n` (Windows line endings), replace `split('\n')` with `split(/\r?\n/)` for cross-platform support.

Would you like an example using a CSV parser for better accuracy?
```
- Model: ChatGPT-4o
- Use: line.split(',') will also cause the ‘amenities’ value - ["Wifi", "Kitchen", "Hot water", "Heating", "Elevator", "Shampoo", "TV", "Essentials", "Hangers", "Smoke alarm", "Hair dryer", "First aid kit", "Dryer", "Fire extinguisher", "Iron", "Washer"] - splitting into multiple elements. So I asked ChatGPT again. Finally I considered all its answers and chose csv-parser to parse the csv file.


2. To get an idea on how to create a filter 
- Prompt: Filter: price, number of rooms, review score & combination of any of these. how to implement a logic like that in JavaScript
- Response:
```
To implement a filtering logic in JavaScript that allows filtering based on price, number of rooms, and review score (individually or in combination), you can follow these steps:

### 1. **Create Sample Data**  
Let's assume you have an array of objects representing listings (hotels, apartments, etc.):

const listings = [
    { id: 1, price: 100, rooms: 2, reviewScore: 4.5 },
    { id: 2, price: 200, rooms: 3, reviewScore: 4.8 },
    { id: 3, price: 150, rooms: 1, reviewScore: 3.9 },
    { id: 4, price: 80, rooms: 2, reviewScore: 4.2 },
    { id: 5, price: 300, rooms: 4, reviewScore: 5.0 }
];

### 2. **Implement a Filtering Function**
Define a function that takes an object of filters and applies them dynamically.

function filterListings(listings, filters) {
    return listings.filter(listing => {
        return (!filters.minPrice || listing.price >= filters.minPrice) &&
               (!filters.maxPrice || listing.price <= filters.maxPrice) &&
               (!filters.minRooms || listing.rooms >= filters.minRooms) &&
               (!filters.maxRooms || listing.rooms <= filters.maxRooms) &&
               (!filters.minReviewScore || listing.reviewScore >= filters.minReviewScore);
    });
}

### 3. **Use the Function with Various Filters**
You can call this function with different filtering criteria:

const filters = {
    minPrice: 100,
    maxPrice: 250,
    minRooms: 2,
    minReviewScore: 4.0
};

const filteredListings = filterListings(listings, filters);
console.log(filteredListings);

### 4. **Explanation**
- Each filter condition is optional. If a filter is `undefined` or `null`, it won't affect the filtering logic.
- The filtering function iterates through `listings` and checks each condition dynamically.
- Logical AND (`&&`) ensures that all applied filters must match.

### 5. **Extensibility**
If you want to add more filters (e.g., location, amenities), just extend the `filters` object and update the filtering function accordingly.

Would you like an interactive UI for this, or does this logic suffice for your use case? 🚀
```
- Model: ChatGPT 4o
- Use: (modified based on it)

3. To get an idea of calculating the avg. price per rooms by Array.reduce() 
- Prompt: JavaScript: How to split an array into different arrays based on criteria. For examples, an array has different objects (one key is "rooms"), I want to split into different arrays by the number of rooms?
- Response:
```
You can use the `reduce()` function to group objects into separate arrays based on the value of the `rooms` key. Here's an example:

### Example:
const data = [
    { id: 1, name: "House A", rooms: 3 },
    { id: 2, name: "House B", rooms: 2 },
    { id: 3, name: "House C", rooms: 3 },
    { id: 4, name: "House D", rooms: 1 },
    { id: 5, name: "House E", rooms: 2 }
];

const groupedByRooms = data.reduce((acc, item) => {
    // If the key doesn't exist, create an array
    if (!acc[item.rooms]) {
        acc[item.rooms] = [];
    }
    // Push the item to the corresponding array
    acc[item.rooms].push(item);
    return acc;
}, {});

console.log(groupedByRooms);

### Output:
{
  '1': [ { id: 4, name: 'House D', rooms: 1 } ],
  '2': [ { id: 2, name: 'House B', rooms: 2 }, { id: 5, name: 'House E', rooms: 2 } ],
  '3': [ { id: 1, name: 'House A', rooms: 3 }, { id: 3, name: 'House C', rooms: 3 } ]
}

### Explanation:
- `reduce()` iterates over the array.
- It checks if an array exists for the given `rooms` value; if not, it creates one.
- The current item is pushed to the respective array.

If you need the result as an array of arrays instead of an object, you can use `Object.values(groupedByRooms)`.

Let me know if you need further modifications! 🚀
```
- Model: ChatGPT-4o
- Use: modified based on it

4. To get an idea of calculating the ranking
- Prompt: JavaScript: How to rank an object with key as id, number as value by number?
- Response:
```
To rank an object in JavaScript where the keys are IDs and the values are numbers, you can follow these steps:

1. Convert the object into an array of key-value pairs.
2. Sort the array based on the numerical values.
3. Convert the sorted array back into an object if necessary.

### Example:
const data = { 
    a: 10, 
    b: 5, 
    c: 8, 
    d: 20 
};

// Convert object to array and sort by value
const rankedArray = Object.entries(data).sort(([, valueA], [, valueB]) => valueB - valueA);

// Convert sorted array back to object if needed
const rankedObject = Object.fromEntries(rankedArray);

console.log(rankedObject);
/*
Output:
{
  d: 20,
  a: 10,
  c: 8,
  b: 5
}
*/

// If you need rank as an array of objects:
const rankedWithPosition = rankedArray.map(([id, value], index) => ({
  id,
  value,
  rank: index + 1
}));

console.log(rankedWithPosition);
/*
Output:
[
  { id: 'd', value: 20, rank: 1 },
  { id: 'a', value: 10, rank: 2 },
  { id: 'c', value: 8, rank: 3 },
  { id: 'b', value: 5, rank: 4 }
]
*/

### Explanation:
- `Object.entries(data)` converts the object into an array of `[key, value]` pairs.
- `.sort(([, valueA], [, valueB]) => valueB - valueA)` sorts them in descending order.
- `Object.fromEntries(rankedArray)` converts it back to an object.
- If you need ranks explicitly, `.map()` is used to attach ranks to each entry.

Would you like further modifications, such as handling ties? 🚀
```
- Model: ChatGPT-4o
- Use: Did not use it. I returned array only without the ranking field

5. Use to better understand promise
- Prompt:
```
    const data = readFile(sourceFile, { encoding: 'utf8' })
        .then(content => {
            parse(content, {
                columns: true,
                trim: true,
                skip_empty_lines: true
            }, (err, records) => {
                if (err) {
                    console.error(Parsing error, err);
                    return err;
                }
                return records;
                });
            })
        .catch((error) => {
            console.error(Could not read file: ${error});
    });
    Whether the data is a promise or a list
```
- Response:
```
Your variable `data` is a **`Promise`**, not a list (array).

---

### **Why is `data` a Promise?**
Let's break down your code step by step:

const data = readFile(sourceFile, { encoding: 'utf8' })
    .then(content => {
        parse(content, {
            columns: true,
            trim: true,
            skip_empty_lines: true
        }, (err, records) => {
            if (err) {
                console.error(`Parsing error`, err);
                return err;
            }
            return records;  // ⚠️ This return does nothing!
        });
    })
    .catch((error) => {
        console.error(`Could not read file: ${error}`);
    });
---

### **Problem Analysis**
1. `readFile(sourceFile, { encoding: 'utf8' })` **returns a Promise**, so `data` is still a Promise.
2. Inside `.then(content => { ... })`, the `parse` function is **asynchronous**, but it does **not return a Promise**.
3. `parse` uses a **callback function**, so `return records;` inside it **does not affect the `.then()` return value**.

**Conclusion:**
- `data` is still a `Promise`, but it **won't contain the parsed CSV data**, because `parse` does not return a Promise.
- **The correct approach is to make `parse` return a Promise**.

---

### **Corrected Version**
You need to wrap `parse` inside a Promise so that `.then()` can properly return the parsed data.

import { readFile } from "node:fs/promises";
import { parse } from "csv-parse";

/**
 * Parses CSV content into an array of objects.
 * @param {string} content - CSV file content.
 * @returns {Promise<Array<Object>>} Parsed data.
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

// Read and parse the file
const dataPromise = readFile(sourceFile, { encoding: 'utf8' })
    .then(parseCSV)  // Now parseCSV returns a Promise
    .catch(error => {
        console.error(`Could not read file: ${error}`);
        return [];  // Ensures `dataPromise` does not become undefined in case of an error
    });

// Access the final parsed data
dataPromise.then(data => {
    console.log("Parsed CSV data:", data); // Now, `data` is the correctly parsed array
});

---

### **How This Fix Works**
1. `readFile()` still returns a `Promise`.
2. `.then(parseCSV)` ensures that `parseCSV` returns a `Promise`, so `.then(data => {...})` will now have `data` as the parsed CSV array.
3. `.catch()` ensures that if an error occurs, `dataPromise` does not become `undefined` but instead returns an empty array `[]`.

---

### **Final Answer**
- **Original Code:** `data` **is a Promise but does not contain the parsed CSV data**.
- **Fixed Code:** `dataPromise` is still a Promise, but inside `.then(data => {...})`, `data` **will be the parsed array**.

---

Try running this corrected code to properly parse your CSV file! Let me know if you have any further questions. 🚀
```
- Model: ChatGPT-4o
- Use: Learned from it that data is not data but Promise

6. To connect all the functions and requirements in AirBnbDataHandler
- Prompt:
```
How do I implement this order?
1. read→parse
2. filter (need to wait for 1)
3. compute count & avg prices per rooms (need to wait for 2)
4. compute host and rank (need to wait for 1)
5. export to file (need to wait for 2,3, 4)

External calls:
a = AirBnBDataHandler(source, dest)

b = a.read.filter()

c = a.computeStatis()

d = a.computeStatis2()

a.export(b)

a.export(c)

a.export(d)
```
- Response:
```
### **To Implement Functional Programming and Method Chaining While Ensuring Sequential Execution of Operations**
To achieve **functional programming** and **method chaining** while ensuring that operations are executed in the correct order, we need to:
1. **Use Promises to handle asynchronous operations** (ensuring that `read → parse → filter → compute → export` executes sequentially).
2. **Return a new `handler` object in each method** instead of modifying `this` or global variables, adhering to the **pure function** principle.
3. **Process data in a stream-like manner** (each method returns a new object instead of modifying the original data).

---

## **Complete Implementation**
import { readFile, writeFile, appendFile } from 'node:fs/promises';
import { parse } from 'csv-parse';

export function AirBnBDataHandler({ sourceFile = "./listings.csv", outputFile = "./.tempresult" } = {}) {
    return {
        data: Promise.resolve([]), // Initialize data as an empty Promise

        // **1. Read & Parse CSV**
        read() {
            const newData = readFile(sourceFile, { encoding: 'utf8' })
                .then(parseCSV);
            return { ...this, data: newData };
        },

        // **2. Filter Data**
        filter(filters = {}) {
            const newData = this.data.then(data => 
                data.filter(l => (!filters.minPrice || Number(l.price) >= filters.minPrice) &&
                                 (!filters.maxPrice || Number(l.price) <= filters.maxPrice) &&
                                 (!filters.minRooms || Number(l.bedrooms) >= filters.minRooms) &&
                                 (!filters.maxRooms || Number(l.bedrooms) <= filters.maxRooms) &&
                                 (!filters.minRate || Number(l.review_scores_rating) >= filters.minRate))
            );
            return { ...this, data: newData };
        },

        // **3. Compute Room Statistics (Count & Average Prices)**
        computeStatis() {
            const newData = this.data.then(data => {
                const roomStats = data.reduce((acc, curr) => {
                    const key = curr.bedrooms || "Unknown";
                    acc[key] = acc[key] || { count: 0, totalPrice: 0 };
                    acc[key].count += 1;
                    acc[key].totalPrice += Number(curr.price);
                    return acc;
                }, {});

                const result = Object.keys(roomStats).map(key => ({
                    bedrooms: key,
                    count: roomStats[key].count,
                    avgPrice: roomStats[key].totalPrice / roomStats[key].count
                }));

                return result;
            });
            return { ...this, data: newData };
        },

        // **4. Compute Host Statistics & Rank**
        computeStatis2() {
            const newData = this.data.then(data => {
                const hostStats = data.reduce((acc, curr) => {
                    const hostId = curr.host_id || "Unknown";
                    acc[hostId] = acc[hostId] || { count: 0, totalPrice: 0 };
                    acc[hostId].count += 1;
                    acc[hostId].totalPrice += Number(curr.price);
                    return acc;
                }, {});

                const rankedHosts = Object.keys(hostStats)
                    .map(key => ({
                        hostId: key,
                        count: hostStats[key].count,
                        avgPrice: hostStats[key].totalPrice / hostStats[key].count
                    }))
                    .sort((a, b) => b.count - a.count);

                return rankedHosts;
            });
            return { ...this, data: newData };
        },

        // **5. Export Data to File**
        export() {
            return this.data.then(data => {
                return writeFile(outputFile, JSON.stringify(data, null, 2))
                    .then(() => console.log(`Data saved to ${outputFile}`));
            });
        }
    };
}

// **Helper Function: Parse CSV**
function parseCSV(content) {
    return new Promise((resolve, reject) => {
        parse(content, { columns: true, trim: true, skip_empty_lines: true }, (err, records) => {
            if (err) reject(err);
            else resolve(records);
        });
    });
}

---

## **Usage**
const a = AirBnBDataHandler({ sourceFile: "./listings.csv", outputFile: "./.tempresult" });

const b = a.read().filter({ minPrice: 50, maxPrice: 200 });
const c = b.computeStatis();
const d = b.computeStatis2();

b.export(); // Export filtered results
c.export(); // Export computed statistics
d.export(); // Export host rankings

---

## **Core Principles**
### ✅ **Method Chaining**
Each method **returns a new `handler` instance** instead of modifying the original object, allowing for chainable calls like:
const result = AirBnBDataHandler().read().filter({ minPrice: 50 }).computeStatis().export();

### ✅ **Ensuring Execution Order**
All methods depend on `this.data`, which is always a **Promise**. This guarantees that `filter` and subsequent methods will wait for `read` to finish before execution:
a.read().filter().computeStatis().export();
Meaning **`filter` will only execute after `read` is complete**, and `computeStatis` will execute only after `filter` finishes processing.

### ✅ **Pure Functions**
- No `this` modifications—each method **returns a new object**.
- `parseCSV()`, `filter()`, `computeStatis()` are all **pure functions** with no side effects.

---

## **Summary**
| Objective | Solution |
|-----------|----------|
| **Asynchronous Reading & Parsing** | `read()` returns a Promise, ensuring `filter()` waits for the data |
| **Method Chaining** | Each method returns a new `handler`, supporting chainable calls |
| **Data Stream Processing** | `this.data` is always a Promise, ensuring sequential execution |
| **Maintaining Pure Functions** | No global state modification; every function returns new data |

With this approach, you can build a **Functional Programming + Method Chaining + Async** data processing pipeline 🚀🚀🚀
```
- Model: ChatGPT-4o
- Use: adopted the return {...this, data: ...} method

7. To convert a string to a number
- Prompt: JavaScript: how to convert string "1,643.00" to number?
- Response:
```
To convert the string `"1,643.00"` to a number in JavaScript, you need to remove the thousands separator (`,`) and then parse it as a float. You can use `parseFloat()` or `Number()` after replacing the comma:

const str = "1,643.00";
const num = parseFloat(str.replace(/,/g, ''));
console.log(num); // 1643

### Explanation:
- `str.replace(/,/g, '')` removes all commas.
- `parseFloat()` converts the cleaned string to a number.

If the input might have different decimal separators (e.g., `1.643,00` in some locales), you may need to handle that separately using `Intl.NumberFormat` or additional replacements. Let me know if you need that!
```
- Model: ChatGPT-4o
- Use: modified based on it.

8. Also used ChatGPT for help in debugging process