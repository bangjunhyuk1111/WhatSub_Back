const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news-controller'); // Controller 호출

/**
 * GET /news
 * 모든 뉴스 데이터를 가져오는 경로
 */
router.get('/news', newsController.getNews);

module.exports = router;
