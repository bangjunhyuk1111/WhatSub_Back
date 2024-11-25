const express = require('express');
const ShortestPathController = require('../controllers/shortest-path-controller');

const router = express.Router();

/**
 * GET /shortest-path
 * Query Parameters: startStation, endStation
 */
router.get('/', ShortestPathController.getShortestPath);

module.exports = router;