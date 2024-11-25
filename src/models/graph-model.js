const db = require('../../config/database.js');

class GraphModel {
  constructor() {
    this.graph = {};
  }

  /**
   * Fetch all edges from the Stations table
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
      return rows;
    } catch (error) {
      console.error('❌ Error fetching station edges:', error.message);
      throw error;
    }
  }

  /**
   * Build the graph from the fetched edges
   */
  async buildGraph() {
    try {
      const edges = await this.fetchEdges();

      edges.forEach(({ fromNode, toNode, timeWeight, distanceWeight, costWeight, lineNumber }) => {
        // Add edge in forward direction
        if (!this.graph[fromNode]) this.graph[fromNode] = [];
        this.graph[fromNode].push({ toNode, timeWeight, distanceWeight, costWeight, lineNumber });

        // Add reverse edge for bidirectional graph
        if (!this.graph[toNode]) this.graph[toNode] = [];
        this.graph[toNode].push({ toNode: fromNode, timeWeight, distanceWeight, costWeight, lineNumber });
      });

      console.log('✅ Graph successfully built.');
      return this.graph;
    } catch (error) {
      console.error('❌ Error building graph:', error.message);
      throw error;
    }
  }
}

module.exports = GraphModel;
