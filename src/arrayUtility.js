/**
 * merge array together and romove duplicate object
 * 
 * @param {*} array1 
 * @param {*} array2 
 * @param {*} property 
 */
function mergeArray(array1, array2, property) {
    try {
        return array1.concat(array2.filter(obj2 => array1.find(obj1 => obj1[property] === obj2[property])));
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * distance duplicate object in array
 * 
 * @param {*} array 
 * @param {*} property 
 */
const distanceArray = (array, property) => {
    try {
        const temp = [];
        return array.filter(_ => {
            if (temp.indexOf(_[property]) === -1) {
                temp.push(_[property]);
                return true;
            }
            return false;
        });
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * split difference value in array
 * 
 * input 
 * [{a: 1}, {a: 2}, {a: 3}, {a: 1}]
 * output 
 * [[{a:1}, {a:1}], [{a:2}, {a:3}]]
 * 
 * @param {*} array 
 * @param {*} property 
 * @param {*} value 
 */
const splitArray = (array, property, value) => {
    try {
        return [
            array.filter(_ => _[property] === value),
            array.filter(_ => _[property] !== value),
        ];
    } catch (error) {
        console.error(error);
        return [[], []];
    }
}

/**
 * Return array
 * 
 * input 
 * 
 * array1: [{a:1,b:1},{a:1,b:2},{a:3,b:1}]
 * array2: [{a:1,b:1},{a:1,b:3}]
 * property1: "a"
 * value1: 1
 * property2: "b"
 * 
 * output
 * [{a:1,b:1}]
 * 
 * @param {*} array1 
 * @param {*} array2 
 * @param {*} property1 
 * @param {*} value1 
 * @param {*} property2 
 */
const splitByArray = (array1, array2, property1, value1, property2) => {
    try {
        return array1.filter(obj1 => obj1[property1] === value1 && array2.find(obj2 => obj2[property2] === obj1));
    } catch (error) {
        console.error(error);
        return [];
    }
}

export { mergeArray, distanceArray, splitArray, splitByArray };
