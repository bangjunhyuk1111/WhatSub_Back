const db = require('../../config/database.js');

/**
 * GraphModel
 * 데이터베이스에서 그래프 데이터를 가져와 그래프를 생성하는 모델
 */
class GraphModel {
  constructor() {
    this.graph = {}; // 그래프 구조를 저장하는 객체
  }

  /**
   * Stations 테이블에서 모든 간선 데이터를 가져옴
   */
  async fetchEdges() {
    try {
      const query = `
        SELECT 
          from_station_num AS fromNode,
          to_station_num AS toNode,
          time_edge AS timeWeight,
          distance_edge AS distanceWeight,
          cost_edge AS costWeight,
          line_num AS lineNumber
        FROM Stations
      `;
      const [rows] = await db.query(query);
      return rows; // 간선 데이터 반환
    } catch (error) {
      console.error('❌ 역 간선 데이터를 가져오는 중 오류 발생:', error.message);
      throw new Error('역 간선 데이터를 가져오는 데 실패했습니다.');
    }
  }

  /**
   * 가져온 간선 데이터를 기반으로 그래프를 생성
   */
  async buildGraph() {
    try {
      const edges = await this.fetchEdges();

      edges.forEach(({ fromNode, toNode, timeWeight, distanceWeight, costWeight, lineNumber }) => {
        // 정방향 간선 추가
        if (!this.graph[fromNode]) this.graph[fromNode] = [];
        this.graph[fromNode].push({ toNode, timeWeight, distanceWeight, costWeight, lineNumber });

        // 역방향 간선 추가 (양방향 그래프)
        if (!this.graph[toNode]) this.graph[toNode] = [];
        this.graph[toNode].push({ toNode: fromNode, timeWeight, distanceWeight, costWeight, lineNumber });
      });

      console.log('✅ 그래프가 성공적으로 생성되었습니다.');
      return this.graph; // 생성된 그래프 반환
    } catch (error) {
      console.error('❌ 그래프 생성 중 오류 발생:', error.message);
      throw new Error('그래프 생성에 실패했습니다.');
    }
  }
}

module.exports = GraphModel;
