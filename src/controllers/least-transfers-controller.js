const { StatusCodes } = require('http-status-codes');
const LeastTransfersService = require('../services/least-transfers-service');

/**
 * LeastTransfersController
 * 컨트롤러: 최소 환승 경로를 계산하고 반환
 */
const LeastTransfersController = {
  /**
   * 최소 환승 경로를 계산
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   */
  async getLeastTransfersPaths(req, res) {
    try {
      const { startStation, endStation } = req.query;

      // 출발역과 도착역이 제공되지 않은 경우
      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: '출발역과 도착역은 필수 입력값입니다.',
        });
      }

      const service = new LeastTransfersService();
      const result = await service.calculateLeastTransfersPaths(
        Number(startStation),
        Number(endStation)
      );

      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: '최소 환승 경로가 성공적으로 계산되었습니다.',
        data: result,
      });
    } catch (error) {
      console.error('❌ 최소 환승 경로 계산 중 오류 발생:', error.message);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: '최소 환승 경로를 계산하는 데 실패했습니다.',
        error: error.message,
      });
    }
  },
};

module.exports = LeastTransfersController;
