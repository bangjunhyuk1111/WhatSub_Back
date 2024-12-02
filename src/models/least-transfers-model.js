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
      console.log('✅ Graph successfully built with bidirectional edges.');
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
    return hours > 0
      ? `${hours}시간 ${minutes}분 ${remainingSeconds}초`
      : `${minutes}분 ${remainingSeconds}초`;
  }

  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  async calculateLeastTransfersPaths(startStation, endStation) {
    try {
      await this.buildGraph();

      const distances = {};
      const transfers = {};
      const paths = {};
      const priorityQueue = [];
      const visited = new Set();

      // Initialize distances and transfers
      Object.keys(this.graph).forEach((station) => {
        distances[station] = Infinity;
        transfers[station] = Infinity;
        paths[station] = [];
      });

      distances[startStation] = 0;
      transfers[startStation] = 0;
      paths[startStation] = [];

      priorityQueue.push({
        station: startStation,
        totalTime: 0,
        totalCost: 0,
        transferCount: 0,
        lineNumber: null,
        path: [],
      });

      while (priorityQueue.length > 0) {
        // Sort the priority queue by transfers and then by time
        priorityQueue.sort((a, b) => {
          if (a.transferCount === b.transferCount) {
            return a.totalTime - b.totalTime;
          }
          return a.transferCount - b.transferCount;
        });

        const current = priorityQueue.shift();
        const { station, totalTime, transferCount, lineNumber, path } = current;

        const visitKey = `${station}_${lineNumber}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);

        // If destination is reached, add path to results
        if (station === endStation) {
          paths[endStation].push({ ...current });
          continue;
        }

        // Explore neighbors
        this.graph[station].forEach(({ toNode, timeWeight, costWeight, lineNumber: nextLine }) => {
          const isTransfer = lineNumber !== null && lineNumber !== nextLine ? 1 : 0;
          const newTransferCount = transferCount + isTransfer;
          const newTotalTime = totalTime + timeWeight;

          // Push all possible paths to queue without overwriting previous paths
          priorityQueue.push({
            station: toNode,
            totalTime: newTotalTime,
            totalCost: current.totalCost + costWeight,
            transferCount: newTransferCount,
            lineNumber: nextLine,
            path: [
              ...path,
              {
                fromStation: station,
                toStation: toNode,
                lineNumber: nextLine,
                timeOnLine: timeWeight,
                costOnLine: costWeight,
              },
            ],
          });
        });
      }

      if (!paths[endStation] || paths[endStation].length === 0) {
        throw new Error('No paths found between the specified stations.');
      }

      // Find minimum transfers
      const minTransfers = Math.min(...paths[endStation].map((p) => p.transferCount));

      // Filter paths with minimum transfers
      const filteredPaths = paths[endStation].filter((p) => p.transferCount === minTransfers);

      // Merge segments for display
      const formattedPaths = filteredPaths.map(({ path, totalTime, totalCost }) => {
        const mergedPath = [];
        path.forEach((segment) => {
          const lastSegment = mergedPath[mergedPath.length - 1];
          if (lastSegment && lastSegment.lineNumber === segment.lineNumber) {
            lastSegment.toStation = segment.toStation;
            lastSegment.timeOnLine += segment.timeOnLine;
            lastSegment.costOnLine += segment.costOnLine;
          } else {
            mergedPath.push({ ...segment });
          }
        });

        return {
          totalTime: LeastTransfersModel.formatTime(totalTime),
          totalCost: LeastTransfersModel.formatCost(totalCost),
          segments: mergedPath.map((segment) => ({
            ...segment,
            timeOnLine: LeastTransfersModel.formatTime(segment.timeOnLine),
            costOnLine: LeastTransfersModel.formatCost(segment.costOnLine),
          })),
        };
      });

      return {
        startStation,
        endStation,
        totalTransfers: minTransfers,
        paths: formattedPaths,
      };
    } catch (error) {
      console.error('❌ Error calculating least transfers paths:', error.message);
      throw new Error('Failed to calculate least transfers paths.');
    }
  }
}

module.exports = LeastTransfersModel;
