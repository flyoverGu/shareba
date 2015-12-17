'use strict';
let fs = require('fs');

let saveData = (data) => {
    console.log('开始保存数据');
    const path = './spider/db/movie.js';
    try {
        fs.writeFile(path, JSON.stringify(data), {
            encoding: 'utf8'
        });
    } catch (e) {
        console.log(e);
    }
}

let getData = () => {
    const path = './spider/db/movie.js';
    try {
        const mStr = fs.readFileSync(path, 'utf8');
        return JSON.parse(mStr);
    } catch(e) {
        console.log(e);
        return [];
    }
}

module.exports = {
    saveData,
    getData
}
