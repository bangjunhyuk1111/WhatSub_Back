const { StatusCodes } = require('http-status-codes');
const LeastTransfersService = require('../services/least-transfers-service');

const LeastTransfersController = {
  async getLeastTransfersPaths(req, res) {
    try {
      const { startStation, endStation } = req.query;

      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'startStation and endStation are required',
        });
      }

      const service = new LeastTransfersService();
      const result = await service.calculateLeastTransfersPaths(
        Number(startStation),
        Number(endStation)
      );

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Least transfers paths calculated successfully',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error in getLeastTransfersPaths:', error.message);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to calculate least transfers paths',
        error: error.message,
      });
    }
  },
};

module.exports = LeastTransfersController;
