const GraphModel = require('../models/graph-model');

class GraphService {
  constructor() {
    this.graph = {}; // 그래프 상태를 저장할 객체
  }

  /**
   * Build the graph using data from the GraphModel
   */
  async buildGraph() {
    try {
      const graphModel = new GraphModel();
      this.graph = await graphModel.buildGraph(); // 그래프 생성
      return this.graph; // 생성된 그래프 반환
    } catch (error) {
      console.error('❌ Error in GraphService:', error.message);
      throw new Error('Failed to build the graph. Please try again later.');
    }
  }

  /**
   * Get the current state of the graph
   */
  getGraph() {
    return this.graph; // 현재 그래프 반환
  }
}

module.exports = GraphService;
