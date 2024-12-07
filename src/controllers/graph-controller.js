const { StatusCodes } = require('http-status-codes'); // HTTP 상태 코드 라이브러리
const GraphService = require('../services/graph-service');

let graphServiceInstance; // 그래프 상태를 메모리에 유지하기 위한 변수

/**
 * GraphController
 * 그래프 초기화 및 상태를 관리하는 컨트롤러
 */
const GraphController = {
  /**
   * 그래프를 초기화하고 메모리에 저장
   * Method: POST
   */
  async initializeGraph(req, res) {
    try {
      // GraphService의 새 인스턴스 생성
      graphServiceInstance = new GraphService();

      // 서비스에서 그래프를 생성
      const graph = await graphServiceInstance.buildGraph();

      // 성공 응답 반환
      return res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        message: '그래프가 성공적으로 생성되었습니다.',
        graph,
      });
    } catch (error) {
      console.error('❌ 그래프 초기화 중 오류 발생:', error.message);

      // 오류 응답 반환
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: '그래프 생성 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  },

  /**
   * 현재 그래프 상태를 반환
   * Method: GET
   */
  getGraphState(req, res) {
    try {
      // 그래프가 초기화되었는지 확인
      if (!graphServiceInstance || !graphServiceInstance.getGraph()) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: '그래프가 존재하지 않습니다. 먼저 그래프를 초기화하세요.',
        });
      }

      // 현재 그래프 상태 반환
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: '그래프 상태를 성공적으로 가져왔습니다.',
        graph: graphServiceInstance.getGraph(),
      });
    } catch (error) {
      console.error('❌ 그래프 상태 조회 중 오류 발생:', error.message);

      // 오류 응답 반환
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: '그래프 상태 조회 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  },
};

module.exports = GraphController;
