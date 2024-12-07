const { StatusCodes } = require('http-status-codes');
const ShortestPathService = require('../services/shortest-path-service');
const ShortestCostService = require('../services/cheapest-path-service');
const LeastTransfersService = require('../services/least-transfers-service');

/**
 * CombinedPathController
 * 컨트롤러: 최단 경로, 최소 비용 경로, 최소 환승 경로를 계산하고 결합된 결과를 반환
 */
const CombinedPathController = {
  /**
   * GET /combined-paths
   * 출발역과 도착역을 기반으로 최단 경로, 최소 비용 경로, 최소 환승 경로를 계산합니다.
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   */
  async getCombinedPaths(req, res) {
    try {
      const { startStation, endStation } = req.query;

      // 출발역과 도착역 검증
      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: '출발역과 도착역은 필수 입력값입니다.',
        });
      }

      const start = Number(startStation);
      const end = Number(endStation);

      if (isNaN(start) || isNaN(end)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: '출발역과 도착역은 유효한 숫자여야 합니다.',
        });
      }

      // 서비스 초기화
      const shortestPathService = new ShortestPathService();
      const shortestCostService = new ShortestCostService();
      const leastTransfersService = new LeastTransfersService();

      // 모든 경로 계산 (병렬 실행)
      const [shortestPath, cheapestPath, leastTransfersPath] = await Promise.all([
        shortestPathService.calculateShortestPath(start, end),
        shortestCostService.calculateShortestCostPath(start, end),
        leastTransfersService.calculateLeastTransfersPaths(start, end),
      ]);

      // 결과 결합
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

      // 응답 반환
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: '경로가 성공적으로 계산되었습니다.',
        data: combinedResult,
      });
    } catch (error) {
      console.error('❌ 경로 계산 중 오류 발생:', error.message);

      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: '경로를 계산하는 데 실패했습니다.',
        error: error.message,
      });
    }
  },
};

module.exports = CombinedPathController;
