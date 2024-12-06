const express = require('express');

// Import services instead of controllers
const ShortestPathService = require('../services/shortest-path-service');
const ShortestCostService = require('../services/cheapest-path-service');
const LeastTransfersService = require('../services/least-transfers-service');

// Define the router
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
                error: 'startStation과 endStation을 제공해야 합니다.',
            });
        }

        // Parse query parameters into numbers
        const start = Number(startStation);
        const end = Number(endStation);

        if (isNaN(start) || isNaN(end)) {
            return res.status(400).json({
                error: 'startStation과 endStation은 숫자여야 합니다.',
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

        // Check if paths are defined
        const getPaths = (path) => path && path.paths ? path.paths : [];

        // Variable to store the comparison result
        let comparisonResult = 0;

        // Function to compare paths ignoring the metadata like totalTransfers, totalCost, etc.
        const comparePaths = (path1, path2) => {
            const paths1 = getPaths(path1);
            const paths2 = getPaths(path2);

            if (paths1.length !== paths2.length) return false;
            for (let i = 0; i < paths1.length; i++) {
                const segments1 = paths1[i].segments;
                const segments2 = paths2[i].segments;
                if (segments1.length !== segments2.length) return false;
                for (let j = 0; j < segments1.length; j++) {
                    if (
                        segments1[j].fromStation !== segments2[j].fromStation ||
                        segments1[j].toStation !== segments2[j].toStation ||
                        segments1[j].lineNumber !== segments2[j].lineNumber ||
                        segments1[j].timeOnLine !== segments2[j].timeOnLine ||
                        segments1[j].costOnLine !== segments2[j].costOnLine
                    ) {
                        return false;
                    }
                }
            }
            return true;
        };

        // Compare the paths and assign the appropriate value to comparisonResult
        if (comparePaths(shortestPath, cheapestPath) && comparePaths(shortestPath, leastTransfersPath)) {
            comparisonResult = 4; // All paths are the same
        } else if (comparePaths(shortestPath, cheapestPath)) {
            comparisonResult = 1; // Shortest and Cheapest paths are the same
        } else if (comparePaths(shortestPath, leastTransfersPath)) {
            comparisonResult = 2; // Shortest and Least Transfers paths are the same
        } else if (comparePaths(cheapestPath, leastTransfersPath)) {
            comparisonResult = 3; // Cheapest and Least Transfers paths are the same
        }

        // Combine the results with the comparison result
        const combinedResult = {
            shortestPath,
            cheapestPath,
            leastTransfersPath,
            comparisonResult, // Include comparison result in the response
        };

        // Respond with the combined data
        res.status(200).json(combinedResult);
    } catch (error) {
        console.error('❌ Error in /combined-path:', error.message);
        next(error);
    }
});

// Export the router so it can be used in other files
module.exports = router;
