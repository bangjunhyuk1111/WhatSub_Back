// src/routes/newsRoutes.js
const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news-controller'); // src/controllers 경로로 수정

// 뉴스 가져오기
router.get('/news', newsController.getNews);

module.exports = router;