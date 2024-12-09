const ShortestCostModel = require('../models/cheapest-path-model');

/**
 * ShortestCostService
 * 서비스: 가장 저렴한 경로 계산 로직을 처리
 */
class ShortestCostService {
  constructor() {
    this.shortestCostModel = new ShortestCostModel();
  }

  /**
   * 시작역과 도착역 사이의 가장 저렴한 경로를 계산
   */
  async calculateShortestCostPath(startStation, endStation) {
    try {
      return await this.shortestCostModel.calculateShortestCostPath(startStation, endStation);
    } catch (error) {
      console.error('❌ ShortestCostService에서 오류 발생:', error.message);
      throw new Error('역 번호를 확인하세요');
    }
  }
}

module.exports = ShortestCostService;
