const ShortestPathModel = require('../models/shortest-path-model');

class ShortestPathService {
  constructor() {
    this.shortestPathModel = new ShortestPathModel();
  }

  /**
   * Calculate the shortest path between two stations
   * @param {Number} startStation - Starting station number
   * @param {Number} endStation - Destination station number
   * @returns {Object} - Shortest path result
   */
  async calculateShortestPath(startStation, endStation) {
    try {
      const result = await this.shortestPathModel.calculateShortestPath(startStation, endStation);
      return result;
    } catch (error) {
      console.error('❌ Error in ShortestPathService:', error.message);
      throw error;
    }
  }
}

module.exports = ShortestPathService;
