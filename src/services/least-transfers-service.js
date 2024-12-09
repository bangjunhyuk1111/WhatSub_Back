const LeastTransfersModel = require('../models/least-transfers-model');

/**
 * LeastTransfersService
 * 서비스: 최소 환승 경로 로직을 처리
 */
class LeastTransfersService {
  constructor() {
    this.leastTransfersModel = new LeastTransfersModel();
  }

  /**
   * 최소 환승 경로 계산
   * @param {number} startStation - 출발역 번호
   * @param {number} endStation - 도착역 번호
   * @returns {Object} 최소 환승 경로 데이터
   */
  async calculateLeastTransfersPaths(startStation, endStation) {
    try {
      const result = await this.leastTransfersModel.calculateLeastTransfersPaths(
        startStation,
        endStation
      );

      // 중복 경로 제거
      const uniquePaths = result.paths.filter((path, index, self) => {
        const pathString = JSON.stringify(path.segments);
        return (
          self.findIndex(
            (p) => JSON.stringify(p.segments) === pathString
          ) === index
        );
      });

      return {
        startStation: result.startStation,
        endStation: result.endStation,
        totalTransfers: result.totalTransfers,
        paths: uniquePaths,
      };
    } catch (error) {
      console.error('❌ LeastTransfersService에서 오류 발생:', error.message);
      throw new Error('역 번호를 확인하세요');
    }
  }
}

module.exports = LeastTransfersService;
