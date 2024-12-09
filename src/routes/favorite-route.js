const express = require('express');
const router = express.Router();
const { getAllFavoritesController, addFavoriteController } = require('../controllers/favorite-controller');  // 수정된 부분

router.get('/favorite', getAllFavoritesController);  // 수정된 부분
router.post('/favorite', addFavoriteController);  // 수정된 부분

module.exports = router;
