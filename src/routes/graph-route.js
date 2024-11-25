const express = require('express');
const GraphController = require('../controllers/graph-controller');

const router = express.Router();

/**
 * Route: Initialize Graph
 * Method: POST
 * Description: Build the graph and store it in memory
 */
router.get('/initialize', GraphController.initializeGraph);

/**
 * Route: Get Graph State
 * Method: GET
 * Description: Fetch the current graph structure
 */
router.get('/state', GraphController.getGraphState);

module.exports = router;
