const fs = require('fs');
const path = require('path');

module.exports = app => {
    fs
        .readSync(__dirname)
        .filter(file => ((file.indexOf('.')) !== 0 && (file !== "indexe.js")))
        .forEach(file => require(path.resolve(__dirname, file))(app))
}