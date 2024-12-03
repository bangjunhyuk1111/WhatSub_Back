// controllers/favoritesController.js
const { getAllFavorites, addFavorite } = require('../services/favorite-service');

// 모든 즐겨찾기 가져오기
const getAllFavoritesController = (req, res) => {
    getAllFavorites((err, favorites) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json(favorites);
    });
};

// 즐겨찾기 추가하기
const addFavoriteController = (req, res) => {
    addFavorite(req.body, (err, newFavorite) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(201).json(newFavorite);
    });
};

module.exports = { getAllFavoritesController, addFavoriteController };
