const express = require('express');
const ShortestPathController = require('../controllers/shortest-path-controller');

const router = express.Router();

/**
 * GET /shortest-path
 * 쿼리 매개변수: startStation, endStation
 * 설명: 출발역(startStation)과 도착역(endStation)을 기반으로 최단 경로를 계산합니다.
 */
router.get('/', ShortestPathController.getShortestPath);

module.exports = router;
