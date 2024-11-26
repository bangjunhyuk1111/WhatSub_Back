const GraphModel = require('./graph-model');

class LeastTransfersModel {
  constructor() {
    this.graph = {};
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

  /**
   * Convert seconds into "X시간 Y분 Z초" or "Y분 Z초"
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
    } else {
      return `${minutes}분 ${remainingSeconds}초`;
    }
  }

  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  async calculateLeastTransfersPath(startStation, endStation) {
    try {
      await this.buildGraph();

      const distances = {};
      const transfers = {};
      const previous = {};
      const visited = new Set();
      const priorityQueue = [];

      Object.keys(this.graph).forEach((node) => {
        distances[node] = Infinity;
        transfers[node] = Infinity;
      });
      distances[startStation] = 0;
      transfers[startStation] = 0;

      priorityQueue.push({ station: startStation, transferCount: 0 });

      while (priorityQueue.length > 0) {
        priorityQueue.sort((a, b) => a.transferCount - b.transferCount);
        const { station: currentStation } = priorityQueue.shift();

        if (visited.has(currentStation)) continue;
        visited.add(currentStation);

        if (currentStation === endStation) break;

        this.graph[currentStation].forEach(({ toNode, timeWeight, costWeight, lineNumber }) => {
          let isTransfer = 0;
          if (previous[currentStation]) {
            if (previous[currentStation].lineNumber !== lineNumber) {
              isTransfer = 1;
            }
          }
          const newTransfers = transfers[currentStation] + isTransfer;

          if (
            newTransfers < transfers[toNode] ||
            (newTransfers === transfers[toNode] && distances[currentStation] + timeWeight < distances[toNode])
          ) {
            distances[toNode] = distances[currentStation] + timeWeight;
            transfers[toNode] = newTransfers;
            previous[toNode] = {
              fromStation: currentStation,
              lineNumber,
              timeWeight,
              costWeight,
            };
            priorityQueue.push({ station: toNode, transferCount: newTransfers });
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

      const pathTransfers = [];
      rawPath.forEach((segment) => {
        const lastTransfer = pathTransfers[pathTransfers.length - 1];
        if (lastTransfer && lastTransfer.lineNumber === segment.lineNumber) {
          lastTransfer.toStation = segment.toStation;
          lastTransfer.timeOnLine += segment.timeOnLine;
          lastTransfer.costOnLine += segment.costOnLine;
        } else {
          pathTransfers.push({ ...segment });
        }
      });

      pathTransfers.forEach((transfer) => {
        transfer.timeOnLine = LeastTransfersModel.formatTime(transfer.timeOnLine);
        transfer.costOnLine = LeastTransfersModel.formatCost(transfer.costOnLine);
      });

      const totalCostValue = pathTransfers.reduce(
        (sum, transfer) => sum + parseInt(transfer.costOnLine.replace(/[^\d]/g, ''), 10),
        0
      );

      return {
        startStation,
        endStation,
        totalTime: LeastTransfersModel.formatTime(distances[endStation]),
        totalCost: LeastTransfersModel.formatCost(totalCostValue),
        totalTransfers: transfers[endStation],
        transfers: pathTransfers,
      };
    } catch (error) {
      console.error('❌ Error calculating least transfers path:', error.message);
      throw new Error('Failed to calculate least transfers path.');
    }
  }
}

module.exports = LeastTransfersModel;
