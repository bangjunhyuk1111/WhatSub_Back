const express = require('express');
const LeastTransfersController = require('../controllers/least-transfers-controller');

const router = express.Router();

/**
 * GET /least-transfers
 * 쿼리 매개변수: startStation, endStation
 * 설명: 출발역(startStation)과 도착역(endStation)을 기반으로 최소 환승 경로를 계산합니다.
 */
router.get('/', LeastTransfersController.getLeastTransfersPaths);

module.exports = router;
