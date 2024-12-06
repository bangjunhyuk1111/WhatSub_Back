const db = require('../../config/database.js');
const GraphModel = require('./graph-model');

class LeastTransfersModel {
  constructor() {
    this.graph = {};
    this.stationInfo = {}; // 역 정보를 저장할 객체
  }

  /**
   * Build the graph and fetch station info
   */
  async buildGraphAndStationInfo() {
    if (Object.keys(this.graph).length > 0 && Object.keys(this.stationInfo).length > 0) {
      return;
    }

    try {
      const graphModel = new GraphModel();
      this.graph = await graphModel.buildGraph();

      // Fetch station information (toilet and store count)
      const query = `
        SELECT 
          from_station_num AS stationNum,
          MAX(toilet_num) AS toiletNum,
          MAX(store_num) AS storeNum
        FROM Stations
        GROUP BY from_station_num
      `;
      const [rows] = await db.query(query);

      rows.forEach(({ stationNum, toiletNum, storeNum }) => {
        this.stationInfo[stationNum] = {
          toilet_num: toiletNum || 0,
          store_num: storeNum || 0,
        };
      });
    } catch (error) {
      throw new Error('Failed to build the graph and fetch station info.');
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
      await this.buildGraphAndStationInfo();

      const distances = {};
      const transfers = {};
      const paths = {};
      const priorityQueue = [];
      const visited = new Map();

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
        const current = priorityQueue.shift();
        const { station, totalTime, transferCount, lineNumber, path } = current;
        const visitKey = `${station}_${lineNumber}`;

        if (visited.has(visitKey)) {
          const prev = visited.get(visitKey);
          if (prev.transferCount < transferCount || (prev.transferCount === transferCount && prev.totalTime <= totalTime)) {
            continue;
          }
        }

        visited.set(visitKey, { transferCount, totalTime });

        if (station === endStation) {
          paths[endStation].push({ ...current });
          continue;
        }

        this.graph[station].forEach(({ toNode, timeWeight, costWeight, lineNumber: nextLine }) => {
          const isTransfer = lineNumber !== null && lineNumber !== nextLine ? 1 : 0;
          const newTransferCount = transferCount + isTransfer;
          const newTotalTime = totalTime + timeWeight;

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
                toiletCount: this.stationInfo[station]?.toilet_num || 0,
                storeCount: this.stationInfo[station]?.store_num || 0,
              },
            ],
          });
        });

        priorityQueue.sort((a, b) => {
          if (a.transferCount === b.transferCount) {
            return a.totalTime - b.totalTime;
          }
          return a.transferCount - b.transferCount;
        });
      }

      if (!paths[endStation] || paths[endStation].length === 0) {
        throw new Error('No paths found between the specified stations.');
      }

      const minTransfers = Math.min(...paths[endStation].map((p) => p.transferCount));

      const filteredPaths = paths[endStation].filter((p) => p.transferCount === minTransfers);

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
      throw new Error('Failed to calculate least transfers paths.');
    }
  }
}

module.exports = LeastTransfersModel;