const express = require('express');

// Import services instead of controllers
const ShortestPathService = require('../services/shortest-path-service');
const ShortestCostService = require('../services/cheapest-path-service');
const LeastTransfersService = require('../services/least-transfers-service');

const router = express.Router();

/**
 * Route: Get combined path details
 * Method: GET
 * Description: Fetch shortest cost, least transfers, and shortest path data
 * Query Parameters: startStation, endStation
 */
router.get('/', async (req, res, next) => {
    try {
        const { startStation, endStation } = req.query;

        // Validate query parameters
        if (!startStation || !endStation) {
            return res.status(400).json({
                error: 'startStation과 endStation을 제공해야 합니다.'
            });
        }

        // Parse query parameters into numbers
        const start = Number(startStation);
        const end = Number(endStation);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({
                error: 'startStation과 endStation은 숫자여야 합니다.'
            });
        }

        // Fetch data from services
        const shortestPathService = new ShortestPathService();
        const shortestCostService = new ShortestCostService();
        const leastTransfersService = new LeastTransfersService();

        const [shortestPath, cheapestPath, leastTransfersPath] = await Promise.all([
            shortestPathService.calculateShortestPath(start, end),
            shortestCostService.calculateShortestCostPath(start, end),
            leastTransfersService.calculateLeastTransfersPaths(start, end),
        ]);

        // Combine the results
        const combinedResult = {
            shortestPath,
            cheapestPath,
            leastTransfersPath,
        };

        // Respond with the combined data
        res.status(200).json(combinedResult);
    } catch (error) {
        console.error('❌ Error in /combined-path:', error.message);
        next(error);
    }
});

module.exports = router;
