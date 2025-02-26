# hw3_functional_program_tiantian


## Creative Feature
- Get the listing IDs per accomodates in the filtered result

## Principle Examples
### Pure Function
Code example:
AirBnBDataHandler.js: 
```

```

Counter example:
```
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