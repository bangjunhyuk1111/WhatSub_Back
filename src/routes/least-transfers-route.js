const express = require('express');
const LeastTransfersController = require('../controllers/least-transfers-controller');

const router = express.Router();

/**
 * Route: Get the path with the least transfers
 * Method: GET
 * URL: /least-transfers-path
 */
router.get('/', LeastTransfersController.getLeastTransfersPath);

module.exports = router;
