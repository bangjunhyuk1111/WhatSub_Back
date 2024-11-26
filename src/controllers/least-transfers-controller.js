const { StatusCodes } = require('http-status-codes');
const LeastTransfersService = require('../services/least-transfers-service');

const LeastTransfersController = {
  async getLeastTransfersPath(req, res) {
    try {
      const { startStation, endStation } = req.query;

      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'startStation and endStation are required',
        });
      }

      const service = new LeastTransfersService();
      const result = await service.calculateLeastTransfersPath(
        Number(startStation),
        Number(endStation)
      );

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('❌ Error in getLeastTransfersPath:', error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Error calculating least transfers path',
        error: error.message,
      });
    }
  },
};

module.exports = LeastTransfersController;
