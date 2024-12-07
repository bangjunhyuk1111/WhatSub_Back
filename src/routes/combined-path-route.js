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

        // Helper function to extract paths
        const getPaths = (path) => (path && path.paths ? path.paths : []);

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

        // Array to store comparison results for each least transfer path
        const comparisonResults = [];

        // Function to evaluate comparison result for a single least transfer path
        const evaluateSinglePath = (leastTransferPath) => {
            if (
                comparePaths(shortestPath, cheapestPath) &&
                comparePaths(shortestPath, leastTransferPath) &&
                comparePaths(cheapestPath, leastTransferPath)
            ) {
                return 4; // All paths are the same
            } else if (comparePaths(shortestPath, cheapestPath)) {
                return 1; // Shortest and Cheapest paths are the same
            } else if (comparePaths(shortestPath, leastTransferPath)) {
                return 2; // Shortest and this Least Transfers path are the same
            } else if (comparePaths(cheapestPath, leastTransferPath)) {
                return 3; // Cheapest and this Least Transfers path are the same
            }
            return 0; // No overlap
        };

        // Evaluate each path in leastTransfersPath
        getPaths(leastTransfersPath).forEach((path, index) => {
            const result = evaluateSinglePath(path);
            comparisonResults.push({ leastTransferPathIndex: index + 1, comparisonResult: result });
        });

        // Combine the results with the comparison results
        const combinedResult = {
            shortestPath,
            cheapestPath,
            leastTransfersPath,
            comparisonResults, // Include comparison results for each least transfer path
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
