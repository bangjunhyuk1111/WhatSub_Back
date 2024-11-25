const GraphModel = require('./graph-model');

class ShortestPathModel {
  constructor() {
    this.graph = {}; // 그래프를 저장할 객체
  }

  /**
   * Build the graph using data from the GraphModel
   */
  async buildGraph() {
    if (Object.keys(this.graph).length > 0) {
      console.log('✅ Graph already built. Skipping rebuild.');
      return this.graph; // 그래프가 이미 생성된 경우 반환
    }

    try {
      const graphModel = new GraphModel();
      this.graph = await graphModel.buildGraph(); // 그래프 생성
      console.log('✅ Graph successfully built.');
      return this.graph;
    } catch (error) {
      console.error('❌ Error building graph:', error.message);
      throw new Error('Failed to build the graph.');
    }
  }

  /**
   * Convert seconds into hours, minutes, and seconds
   * @param {Number} seconds - Time in seconds
   * @returns {String} - Time formatted as "X시간 Y분 Z초"
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}시간 ` : ''}${minutes > 0 ? `${minutes}분 ` : ''}${remainingSeconds}초`;
  }

  /**
   * Convert cost into formatted string (₩ 단위)
   * @param {Number} cost - Cost in raw number
   * @returns {String} - Formatted cost (e.g., "3,000원")
   */
  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  /**
   * Calculate the shortest path using Dijkstra's Algorithm
   * @param {Number} startStation - Starting station number
   * @param {Number} endStation - Destination station number
   * @returns {Object} - Path details including total time, total cost, and transfers
   */
  async calculateShortestPath(startStation, endStation) {
    try {
      // 그래프가 없으면 생성
      await this.buildGraph();

      const distances = {};
      const costs = {}; // 각 역까지의 누적 요금
      const previous = {};
      const visited = new Set();
      const priorityQueue = [];

      // Initialize distances, costs, and priority queue
      Object.keys(this.graph).forEach((node) => {
        distances[node] = Infinity;
        costs[node] = Infinity;
      });
      distances[startStation] = 0;
      costs[startStation] = 0;

      priorityQueue.push({ station: startStation, time: 0 });

      while (priorityQueue.length > 0) {
        // Sort queue to get the station with the shortest distance
        priorityQueue.sort((a, b) => a.time - b.time);
        const { station: currentStation } = priorityQueue.shift();

        if (visited.has(currentStation)) continue;
        visited.add(currentStation);

        if (currentStation === endStation) break;

        // Update distances and costs for neighbors
        this.graph[currentStation].forEach(({ toNode, timeWeight, costWeight, lineNumber }) => {
          const newTime = distances[currentStation] + timeWeight;
          const newCost = costs[currentStation] + costWeight;

          if (newTime < distances[toNode]) {
            distances[toNode] = newTime;
            costs[toNode] = newCost;
            previous[toNode] = { fromStation: currentStation, lineNumber, timeWeight, costWeight };
            priorityQueue.push({ station: toNode, time: newTime });
          }
        });
      }

      // Build the path
      const rawPath = [];
      let currentStation = endStation;
      while (currentStation) {
        const prev = previous[currentStation];
        if (!prev) break;
        rawPath.unshift({
          fromStation: prev.fromStation,
          toStation: currentStation,
          lineNumber: prev.lineNumber,
          timeOnLine: prev.timeWeight,
          costOnLine: prev.costWeight,
        });
        currentStation = prev.fromStation;
      }

      // Merge segments with the same lineNumber
      const transfers = [];
      rawPath.forEach((segment) => {
        const lastTransfer = transfers[transfers.length - 1];
        if (lastTransfer && lastTransfer.lineNumber === segment.lineNumber) {
          lastTransfer.toStation = segment.toStation;
          lastTransfer.timeOnLine += segment.timeOnLine;
          lastTransfer.costOnLine += segment.costOnLine;
        } else {
          transfers.push({ ...segment });
        }
      });

      // Convert timeOnLine and costOnLine in transfers
      transfers.forEach((transfer) => {
        transfer.timeOnLine = ShortestPathModel.formatTime(transfer.timeOnLine);
        transfer.costOnLine = ShortestPathModel.formatCost(transfer.costOnLine);
      });

      return {
        startStation,
        endStation,
        totalTime: ShortestPathModel.formatTime(distances[endStation]), // Convert total time
        totalCost: ShortestPathModel.formatCost(costs[endStation]), // Convert total cost
        transfers,
      };
    } catch (error) {
      console.error('❌ Error calculating shortest path:', error.message);
      throw new Error('Failed to calculate shortest path.');
    }
  }
}

module.exports = ShortestPathModel;
