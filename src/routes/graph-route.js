const express = require('express');
const GraphController = require('../controllers/graph-controller');

const router = express.Router();

/**
 * Route: Initialize Graph
 * Method: POST
 * Description: 그래프를 생성하고 메모리에 저장
 */
router.get('/initialize', GraphController.initializeGraph);

/**
 * Route: Get Graph State
 * Method: GET
 * Description: 현재 그래프 구조를 조회
 */
router.get('/state', GraphController.getGraphState);

module.exports = router;
