const express = require('express');
const CombinedPathController = require('../controllers/combined-path-controller');

const router = express.Router();

/**
 * GET /combined-paths
 * 쿼리 매개변수: startStation, endStation
 * 설명: 
 * - 출발역과 도착역을 기반으로 최단 경로, 최소 비용 경로, 최소 환승 경로를 계산합니다.
 * - 계산된 결과를 결합하여 반환합니다.
 */
router.get('/', CombinedPathController.getCombinedPaths);

module.exports = router;
