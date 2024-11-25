const ShortestCostModel = require('../models/cheapest-path-model');

class ShortestCostService {
  constructor() {
    this.shortestCostModel = new ShortestCostModel();
  }

  async calculateShortestCostPath(startStation, endStation) {
    try {
      return await this.shortestCostModel.calculateShortestCostPath(startStation, endStation);
    } catch (error) {
      console.error('❌ Error in ShortestCostService:', error.message);
      throw new Error('Error calculating shortest cost path.');
    }
  }
}

module.exports = ShortestCostService;
