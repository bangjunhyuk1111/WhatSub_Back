const LeastTransfersModel = require('../models/least-transfers-model');

class LeastTransfersService {
  constructor() {
    this.leastTransfersModel = new LeastTransfersModel();
  }

  /**
   * Calculate the path with the least transfers between two stations
   * @param {Number} startStation - Starting station number
   * @param {Number} endStation - Destination station number
   * @returns {Object} - Least transfers path result
   */
  async calculateLeastTransfersPath(startStation, endStation) {
    try {
      return await this.leastTransfersModel.calculateLeastTransfersPath(
        startStation,
        endStation
      );
    } catch (error) {
      console.error('❌ Error in LeastTransfersService:', error.message);
      throw error;
    }
  }
}

module.exports = LeastTransfersService;
