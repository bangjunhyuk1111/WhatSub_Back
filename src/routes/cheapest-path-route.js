const express = require('express');
const ShortestCostController = require('../controllers/cheapest-path-controller');

const router = express.Router();

/**
 * Route: Get shortest cost path
 * Method: GET
 * Description: Calculate the shortest cost path between two stations
 */
router.get('/', ShortestCostController.getShortestCostPath);

module.exports = router;
