const GraphModel = require('./graph-model');

class ShortestPathModel {
  constructor() {
    this.graph = {}; // 그래프를 저장할 객체
  }

  async buildGraph() {
    if (Object.keys(this.graph).length > 0) {
      console.log('✅ Graph already built. Skipping rebuild.');
      return this.graph;
    }

    try {
      const graphModel = new GraphModel();
      this.graph = await graphModel.buildGraph();
      console.log('✅ Graph successfully built.');
      return this.graph;
    } catch (error) {
      console.error('❌ Error building graph:', error.message);
      throw new Error('Failed to build the graph.');
    }
  }

  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}시간 ` : ''}${minutes > 0 ? `${minutes}분 ` : ''}${remainingSeconds}초`;
  }

  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  async calculateShortestPath(startStation, endStation) {
    try {
      await this.buildGraph();

      const distances = {};
      const costs = {};
      const previous = {};
      const visited = new Set();
      const priorityQueue = [];

      Object.keys(this.graph).forEach((node) => {
        distances[node] = Infinity;
        costs[node] = Infinity;
      });
      distances[startStation] = 0;
      costs[startStation] = 0;

      priorityQueue.push({ station: startStation, time: 0 });

      while (priorityQueue.length > 0) {
        priorityQueue.sort((a, b) => a.time - b.time);
        const { station: currentStation } = priorityQueue.shift();

        if (visited.has(currentStation)) continue;
        visited.add(currentStation);

        if (currentStation === endStation) break;

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

      transfers.forEach((transfer) => {
        transfer.timeOnLine = ShortestPathModel.formatTime(transfer.timeOnLine);
        transfer.costOnLine = ShortestPathModel.formatCost(transfer.costOnLine);
      });

      return {
        startStation,
        endStation,
        totalTime: ShortestPathModel.formatTime(distances[endStation]),
        totalCost: ShortestPathModel.formatCost(costs[endStation]),
        transfers,
      };
    } catch (error) {
      console.error('❌ Error calculating shortest path:', error.message);
      throw new Error('Failed to calculate shortest path.');
    }
  }
}

module.exports = ShortestPathModel;
