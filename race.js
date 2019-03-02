//let's use few lib, simulate async.race or promise.race
const once = (func) => {
    let run = false;
    return (...args) => {
        if (run) {
            return;
        }
        run = true;
        return func.apply(null, args);
    };
};

const callbackOncePass = (maxCall, callback) => {
    let num = 0;
    return (err, result) => {
        if (++num >= maxCall) {
            return callback(err, result);
        } else if (!err) {
            return callback(err, result);
        }
    };
};

const race = (array, func, callback) => {
    const length = array.length;
    if (length === 0) {
        return callback();
    }
    const onceCallback = once(callback);
    for (const item of array) {
        func.call(null, item, callbackOncePass(length, onceCallback));
    }
};


module.exports = race;

