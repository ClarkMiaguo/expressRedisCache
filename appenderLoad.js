
function loadAppend(append) {
    try {
        return require(`./append/${append}`);
    } catch (e) {
        throw new Error(`Invalid append: ${append}`);
    }
}

const filterValidType = (config) => !!config.type;
const guardConfigList = (configList) => {
    if (!configList) {
        return [{type: 'redis'}];
    } else if (!Array.isArray(configList)) {
        return [configList];
    }
    return configList;
};

const loadAppends = (configList) => guardConfigList(configList)
    .filter(filterValidType)
    .map((config) => {
        const Klass = loadAppend(config.type);
        return new Klass(config);
    });


module.exports = loadAppends;

