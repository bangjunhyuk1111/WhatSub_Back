const { StatusCodes } = require('http-status-codes');
const ShortestPathService = require('../services/shortest-path-service');
const ShortestCostService = require('../services/cheapest-path-service');
const LeastTransfersService = require('../services/least-transfers-service');

const CombinedPathController = {
    async getCombinedPaths(req, res) {
        try {
            const { startStation, endStation } = req.query;

            if (!startStation || !endStation) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'startStation and endStation are required',
                });
            }

            // Convert startStation and endStation to numbers
            const start = Number(startStation);
            const end = Number(endStation);

            if (isNaN(start) || isNaN(end)) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    status: StatusCodes.BAD_REQUEST,
                    message: 'startStation and endStation must be valid numbers',
                });
            }

            // Initialize services
            const shortestPathService = new ShortestPathService();
            const shortestCostService = new ShortestCostService();
            const leastTransfersService = new LeastTransfersService();

            // Execute all services in parallel
            const [shortestPath, cheapestPath, leastTransfersPath] = await Promise.all([
                shortestPathService.calculateShortestPath(start, end),
                shortestCostService.calculateShortestCostPath(start, end),
                leastTransfersService.calculateLeastTransfersPaths(start, end),
            ]);

            // Combine results
            const combinedResult = {
                shortestPath: {
                    status: StatusCodes.OK,
                    data: shortestPath,
                },
                cheapestPath: {
                    status: StatusCodes.OK,
                    data: cheapestPath,
                },
                leastTransfersPath: {
                    status: StatusCodes.OK,
                    data: leastTransfersPath,
                },
            };

            // Send response
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: 'Combined paths calculated successfully',
                data: combinedResult,
            });
        } catch (error) {
            console.error('❌ Error in getCombinedPaths:', error.message);

            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: 'Failed to calculate combined paths',
                error: error.message,
            });
        }
    },
};

module.exports = CombinedPathController;
