const LeastTransfersModel = require('../models/least-transfers-model');

class LeastTransfersService {
  constructor() {
    this.leastTransfersModel = new LeastTransfersModel();
  }

  async calculateLeastTransfersPaths(startStation, endStation) {
    try {
      const result = await this.leastTransfersModel.calculateLeastTransfersPaths(
        startStation,
        endStation
      );

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
      console.error('❌ Error in LeastTransfersService:', error.message);
      throw new Error('Failed to calculate least transfers paths.');
    }
  }
}

module.exports = LeastTransfersService;