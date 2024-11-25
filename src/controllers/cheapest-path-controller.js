const ShortestCostService = require('../services/cheapest-path-service');
const { StatusCodes } = require('http-status-codes');

const ShortestCostController = {
  async getShortestCostPath(req, res) {
    try {
      const { startStation, endStation } = req.query;

      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'startStation and endStation are required',
        });
      }

      const service = new ShortestCostService();
      const result = await service.calculateShortestCostPath(Number(startStation), Number(endStation));

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('❌ Error in getShortestCostPath:', error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Error calculating shortest cost path',
        error: error.message,
      });
    }
  },
};

module.exports = ShortestCostController;
