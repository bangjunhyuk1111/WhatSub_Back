const express = require('express');
const ShortestCostController = require('../controllers/cheapest-path-controller');

const router = express.Router();

/**
 * 라우트: 가장 저렴한 경로 조회
 * 메서드: GET
 * 설명: 두 역 사이의 가장 저렴한 경로를 계산
 */
router.get('/', ShortestCostController.getShortestCostPath);

module.exports = router;
