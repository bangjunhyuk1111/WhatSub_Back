const ShortestPathModel = require('../models/shortest-path-model');

class ShortestPathService {
  constructor() {
    this.shortestPathModel = new ShortestPathModel();
  }

  async calculateShortestPath(startStation, endStation) {
    try {
      return await this.shortestPathModel.calculateShortestPath(startStation, endStation);
    } catch (error) {
      console.error('❌ Error in ShortestPathService:', error.message);
      throw error;
    }
  }
}

module.exports = ShortestPathService;
