const GraphModel = require('../models/graph-model');

/**
 * GraphService
 * 그래프 생성을 관리하고 상태를 반환하는 서비스
 */
class GraphService {
  constructor() {
    this.graph = {}; // 그래프 상태를 저장할 객체
  }

  /**
   * GraphModel을 사용하여 그래프를 생성
   */
  async buildGraph() {
    try {
      const graphModel = new GraphModel();
      this.graph = await graphModel.buildGraph(); // 그래프 생성
      return this.graph; // 생성된 그래프 반환
    } catch (error) {
      console.error('❌ GraphService에서 오류 발생:', error.message);
      throw new Error('그래프 생성에 실패했습니다. 나중에 다시 시도하세요.');
    }
  }

  /**
   * 현재 그래프 상태를 반환
   */
  getGraph() {
    return this.graph; // 현재 그래프 반환
  }
}

module.exports = GraphService;
