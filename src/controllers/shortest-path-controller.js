const { StatusCodes } = require('http-status-codes');
const ShortestPathService = require('../services/shortest-path-service');

const ShortestPathController = {
  async getShortestPath(req, res) {
    try {
      const { startStation, endStation } = req.query;

      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'startStation and endStation are required',
        });
      }

      const service = new ShortestPathService();
      const result = await service.calculateShortestPath(Number(startStation), Number(endStation));

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('❌ Error in getShortestPath:', error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Error calculating shortest path',
        error: error.message,
      });
    }
  },
};

module.exports = ShortestPathController;
