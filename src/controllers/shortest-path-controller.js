const { StatusCodes } = require('http-status-codes'); // HTTP 상태 코드 라이브러리
const ShortestPathService = require('../services/shortest-path-service');


const ShortestPathController = {
  async getShortestPath(req, res) {
    try {
      const { startStation, endStation } = req.query;

      // 요청 파라미터 유효성 검사
      if (!startStation || !endStation) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: StatusCodes.BAD_REQUEST,
          message: 'startStation and endStation are required',
        });
      }

      // ShortestPathService 호출
      const service = new ShortestPathService();
      const result = await service.calculateShortestPath(Number(startStation), Number(endStation));

      // 결과 반환
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: 'Shortest path calculated successfully',
        data: result,
      });
    } catch (error) {
      console.error('❌ Error in getShortestPath:', error.message);

      // 서버 에러 처리
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Error calculating shortest path',
        error: error.message,
      });
    }
  },
};

module.exports = ShortestPathController;
