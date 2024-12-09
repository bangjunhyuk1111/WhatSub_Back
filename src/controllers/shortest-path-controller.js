const { StatusCodes } = require('http-status-codes');
const ShortestPathService = require('../services/shortest-path-service');

/**
 * ShortestPathController
 * 컨트롤러: 최단 경로를 계산하고 결과를 반환
 */
const ShortestPathController = {
  /**
   * GET /shortest-path
   * 두 역 간의 최단 경로를 계산하여 반환합니다.
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   */
  async getShortestPath(req, res) {
    try {
      const { startStation, endStation } = req.query;

      // 출발역과 도착역이 제공되지 않은 경우
      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: '출발역과 도착역은 필수 입력값입니다.',
        });
      }

      const service = new ShortestPathService();
      const result = await service.calculateShortestPath(Number(startStation), Number(endStation));

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('❌ 최단 경로 계산 중 오류 발생:', error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: '최단 경로를 계산하는 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  },
};

module.exports = ShortestPathController;
