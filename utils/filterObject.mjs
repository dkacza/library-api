export const filterObject = function (obj, ...keys) {
    const filteredObject = {};
    Object.keys(obj).forEach(key => {
        if (keys.includes(key)) filteredObject[key] = obj[key];
    });
    return filteredObject;
};
export const excludeProperties = function (obj, ...keys) {
    const filteredObject = {};
    Object.keys(obj).forEach(key => {
        if (!keys.includes(key)) filteredObject[key] = obj[key];
    });
    return filteredObject;
};
