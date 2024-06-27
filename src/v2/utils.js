"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertIdTO_id = exports.retryAsyncFunction = exports.delay = void 0;
/**
 * Delays the execution of a function by a specified amount of time.
 *
 * @param {number} ms - The number of milliseconds to delay.
 * @return {Promise<void>} A Promise that resolves after the specified delay.
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.delay = delay;
/**
 * Asynchronously retries a function until success or max retries reached.
 *
 * @param {() => Promise<any>} fn - The function to retry.
 * @param {number} maxRetries - The maximum number of retries.
 * @return {Promise<any>} The result of the function after retries.
 */
async function retryAsyncFunction(fn, maxRetries) {
    try {
        return await fn();
    }
    catch (error) {
        if (maxRetries === 0)
            throw error;
        await delay(maxRetries * 1000);
        return retryAsyncFunction(fn, maxRetries - 1);
    }
}
exports.retryAsyncFunction = retryAsyncFunction;
/**
 * Converts the 'id' property of the given object to '_id'.
 *
 * @param {any} data - The object containing the 'id' property to be converted.
 * @return {Promise<any>} A promise that resolves with the object after the conversion.
 */
async function convertIdTO_id(data) {
    return new Promise((resolve, reject) => {
        if (data) {
            const result = {
                ...data,
                _id: data.id
            };
            delete result.id;
            resolve(result);
        }
        else {
            reject(data);
        }
    });
}
exports.convertIdTO_id = convertIdTO_id;
//# sourceMappingURL=utils.js.map