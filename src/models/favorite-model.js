// models/favoritesModel.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../config/favorite.json');

// 파일에서 즐겨찾기 데이터를 읽기
const readFavorites = (callback) => {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) return callback(err, null);
        callback(null, JSON.parse(data));
    });
};

// 파일에 즐겨찾기 데이터를 쓰기
const writeFavorites = (favorites, callback) => {
    fs.writeFile(filePath, JSON.stringify(favorites, null, 2), (err) => {
        if (err) return callback(err);
        callback(null);
    });
};

module.exports = { readFavorites, writeFavorites };
