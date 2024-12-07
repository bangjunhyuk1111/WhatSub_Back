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

      // 경로 중복 비교
      let areEqual1 = false;
      let areEqual2 = false;
      let areEqual3 = false;

      // JSON.stringify()를 사용하여 객체의 내용을 문자열로 변환하여 비교
      if (JSON.stringify(cheapestPath.paths[0]) === JSON.stringify(shortestPath.paths[0])) {
        areEqual1 = true;
      }

      if (JSON.stringify(cheapestPath.paths[0]) === JSON.stringify(leastTransfersPath.paths[0])) {
        areEqual2 = true;
      }

      if (JSON.stringify(shortestPath.paths[0]) === JSON.stringify(leastTransfersPath.paths[0])) {
        areEqual3 = true;
      }

      let comparisonResults = [];

      if (leastTransfersPath.paths.length === 1) {
        // leastTransfersPath가 1개일 때
        if (areEqual1 && !areEqual2 && !areEqual3) {
          comparisonResults[0] = 1;
        } else if (areEqual2 && !areEqual1 && !areEqual3) {
          comparisonResults[0] = 2;
        } else if (areEqual3 && !areEqual2 && !areEqual1) {
          comparisonResults[0] = 3;
        } else if (areEqual1 && areEqual2 && areEqual3) {
          comparisonResults[0] = 4;
        } else {
          comparisonResults[0] = 0;
        }
      } else if (leastTransfersPath.paths.length === 2) {
        // leastTransfersPath가 2개일 때
        // 첫 번째 경로 비교
        if (areEqual1 && !areEqual2 && !areEqual3) {
          comparisonResults[0] = 1;
        } else if (areEqual2 && !areEqual1 && !areEqual3) {
          comparisonResults[0] = 2;
        } else if (areEqual3 && !areEqual2 && !areEqual1) {
          comparisonResults[0] = 3;
        } else if (areEqual1 && areEqual2 && areEqual3) {
          comparisonResults[0] = 4;
        } else {
          comparisonResults[0] = 0;
        }

        // 두 번째 경로 비교
        let areEqual2nd1 = false;
        let areEqual2nd2 = false;
        let areEqual2nd3 = false;

        if (JSON.stringify(cheapestPath.paths[0]) === JSON.stringify(shortestPath.paths[0])) {
          areEqual2nd1 = true;
        }

        if (JSON.stringify(cheapestPath.paths[0]) === JSON.stringify(leastTransfersPath.paths[1])) {
          areEqual2nd2 = true;
        }

        if (JSON.stringify(shortestPath.paths[0]) === JSON.stringify(leastTransfersPath.paths[1])) {
          areEqual2nd3 = true;
        }

        if (areEqual2nd1 && !areEqual2nd2 && !areEqual2nd3) {
          comparisonResults[1] = 1;
        } else if (areEqual2nd2 && !areEqual2nd1 && !areEqual2nd3) {
          comparisonResults[1] = 2;
        } else if (areEqual2nd3 && !areEqual2nd1 && !areEqual2nd2) {
          comparisonResults[1] = 3;
        } else if (areEqual2nd1 && areEqual2nd2 && areEqual2nd3) {
          comparisonResults[1] = 4;
        } else {
          comparisonResults[1] = 0;
        }
      } else {
        comparisonResults[0] = 0;
        comparisonResults[1] = 0;
      }

      // 응답 반환
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: '경로가 성공적으로 계산되었습니다.',
        data: combinedResult,
        comparisonResults,
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
