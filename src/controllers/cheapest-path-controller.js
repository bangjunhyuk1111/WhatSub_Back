const { StatusCodes } = require('http-status-codes');
const ShortestCostService = require('../services/cheapest-path-service');

/**
 * ShortestCostController
 * 컨트롤러: 가장 저렴한 경로를 계산하기 위한 요청 처리
 */
const ShortestCostController = {
  /**
   * GET /shortest-cost-path
   * 가장 저렴한 경로를 계산하고 응답합니다.
   */
  async getShortestCostPath(req, res) {
    try {
      const { startStation, endStation } = req.query;

      // 시작역과 도착역이 없는 경우 요청 오류 처리
      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: '시작역과 도착역은 필수 입력값입니다.',
        });
      }

      // 서비스 호출하여 경로 계산
      const service = new ShortestCostService();
      const result = await service.calculateShortestCostPath(Number(startStation), Number(endStation));

      return res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.error('❌ 가장 저렴한 경로 계산 중 오류:', error.message);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: '가장 저렴한 경로를 계산하는 도중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  },
};

module.exports = ShortestCostController;
