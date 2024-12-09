const ShortestPathModel = require('../models/shortest-path-model');

/**
 * ShortestPathService
 * 서비스: 최단 경로 계산 로직을 처리
 */
class ShortestPathService {
  constructor() {
    this.shortestPathModel = new ShortestPathModel(); // ShortestPathModel 인스턴스 생성
  }

  /**
   * 최단 경로 계산
   * @param {number} startStation - 출발역 번호
   * @param {number} endStation - 도착역 번호
   * @returns {Object} 최단 경로 데이터
   * @throws {Error} 최단 경로 계산 중 오류 발생 시
   */
  async calculateShortestPath(startStation, endStation) {
    try {
      return await this.shortestPathModel.calculateShortestPath(startStation, endStation);
    } catch (error) {
      console.error('❌ ShortestPathService에서 오류 발생:', error.message);
      throw new Error('역 번호를 확인하세요');
    }
  }
}

module.exports = ShortestPathService;
