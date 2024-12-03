// services/favoritesService.js
const { readFavorites, writeFavorites } = require('../models/favorite-model');

// 모든 즐겨찾기 가져오기
const getAllFavorites = (callback) => {
    readFavorites((err, favorites) => {
        if (err) {
            return callback({ message: '데이터 로드 실패' }, null);
        }
        callback(null, favorites);
    });
};

// 즐겨찾기 추가하기
const addFavorite = (favoriteData, callback) => {
    readFavorites((err, favorites) => {
        if (err) {
            return callback({ message: '데이터 로드 실패' });
        }

        const newFavorite = {
            id: Date.now(),  // 임시 ID
            ...favoriteData
        };

        favorites.push(newFavorite);

        writeFavorites(favorites, (err) => {
            if (err) {
                return callback({ message: '저장 실패' });
            }
            callback(null, newFavorite);
        });
    });
};

module.exports = { getAllFavorites, addFavorite };
