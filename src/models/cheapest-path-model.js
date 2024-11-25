const GraphModel = require('./graph-model');

class ShortestCostModel {
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

  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}시간 ` : ''}${minutes > 0 ? `${minutes}분 ` : ''}${remainingSeconds}초`;
  }

  async calculateShortestCostPath(startStation, endStation) {
    try {
      await this.buildGraph();

      const costs = {};
      const times = {};
      const previous = {};
      const visited = new Set();
      const priorityQueue = [];

      Object.keys(this.graph).forEach((node) => {
        costs[node] = Infinity;
        times[node] = Infinity;
      });
      costs[startStation] = 0;
      times[startStation] = 0;

      priorityQueue.push({ station: startStation, cost: 0 });

      while (priorityQueue.length > 0) {
        priorityQueue.sort((a, b) => a.cost - b.cost);
        const { station: currentStation } = priorityQueue.shift();

        if (visited.has(currentStation)) continue;
        visited.add(currentStation);

        if (currentStation === endStation) break;

        this.graph[currentStation].forEach(({ toNode, costWeight, timeWeight, lineNumber }) => {
          const newCost = costs[currentStation] + costWeight;
          const newTime = times[currentStation] + timeWeight;

          if (newCost < costs[toNode]) {
            costs[toNode] = newCost;
            times[toNode] = newTime;
            previous[toNode] = { fromStation: currentStation, lineNumber, costWeight, timeWeight };
            priorityQueue.push({ station: toNode, cost: newCost });
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
          costOnLine: prev.costWeight,
          timeOnLine: prev.timeWeight,
        });
        currentStation = prev.fromStation;
      }

      const transfers = [];
      rawPath.forEach((segment) => {
        const lastTransfer = transfers[transfers.length - 1];
        if (lastTransfer && lastTransfer.lineNumber === segment.lineNumber) {
          lastTransfer.toStation = segment.toStation;
          lastTransfer.costOnLine += segment.costOnLine;
          lastTransfer.timeOnLine += segment.timeOnLine;
        } else {
          transfers.push({ ...segment });
        }
      });

      transfers.forEach((transfer) => {
        transfer.costOnLine = ShortestCostModel.formatCost(transfer.costOnLine);
        transfer.timeOnLine = ShortestCostModel.formatTime(transfer.timeOnLine);
      });

      return {
        startStation,
        endStation,
        totalCost: ShortestCostModel.formatCost(costs[endStation]),
        totalTime: ShortestCostModel.formatTime(times[endStation]),
        transfers,
      };
    } catch (error) {
      console.error('❌ Error calculating shortest cost path:', error.message);
      throw new Error('Failed to calculate shortest cost path.');
    }
  }
}

module.exports = ShortestCostModel;
