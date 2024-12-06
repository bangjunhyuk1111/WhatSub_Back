const db = require('../../config/database.js');
const GraphModel = require('./graph-model');

class ShortestPathModel {
  constructor() {
    this.graph = {};
    this.stationInfo = {};
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
    return `${hours > 0 ? `${hours}시간 ` : ''}${minutes > 0 ? `${minutes}분 ` : ''}${remainingSeconds}초`;
  }

  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  async calculateShortestPath(startStation, endStation) {
    try {
      await this.buildGraphAndStationInfo();

      const distances = {};
      const previous = {};
      const visited = new Set();
      const priorityQueue = [];

      Object.keys(this.graph).forEach((node) => {
        distances[node] = Infinity;
      });
      distances[startStation] = 0;

      priorityQueue.push({ station: startStation, time: 0 });

      while (priorityQueue.length > 0) {
        priorityQueue.sort((a, b) => a.time - b.time);
        const { station: currentStation } = priorityQueue.shift();

        if (visited.has(currentStation)) continue;
        visited.add(currentStation);

        if (currentStation === endStation) break;

        this.graph[currentStation].forEach(({ toNode, timeWeight, costWeight, lineNumber }) => {
          const newTime = distances[currentStation] + timeWeight;

          if (newTime < distances[toNode]) {
            distances[toNode] = newTime;
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
      let lastLineNumber = null; // lastLineNumber 변수 추가
      rawPath.forEach((segment) => {
        const lastTransfer = transfers[transfers.length - 1];

        // 현재 segment의 lineNumber와 마지막 segment의 lineNumber가 다를 경우 환승이므로
        if (lastLineNumber !== null && lastLineNumber !== segment.lineNumber) {
          // 환승 횟수 증가
          transfers.push({
            ...segment,
            toiletCount: this.stationInfo[segment.fromStation]?.toilet_num || 0,
            storeCount: this.stationInfo[segment.fromStation]?.store_num || 0,
          });
        } else if (lastTransfer && lastTransfer.lineNumber === segment.lineNumber) {
          lastTransfer.toStation = segment.toStation;
          lastTransfer.timeOnLine += segment.timeOnLine;
          lastTransfer.costOnLine += segment.costOnLine;
        } else {
          transfers.push({
            ...segment,
            toiletCount: this.stationInfo[segment.fromStation]?.toilet_num || 0,
            storeCount: this.stationInfo[segment.fromStation]?.store_num || 0,
          });
        }

        lastLineNumber = segment.lineNumber; // lastLineNumber 갱신
      });

      transfers.forEach((transfer) => {
        transfer.timeOnLine = ShortestPathModel.formatTime(transfer.timeOnLine);
        transfer.costOnLine = ShortestPathModel.formatCost(transfer.costOnLine);
      });

      // Total cost calculation
      const totalCost = transfers.reduce((acc, transfer) => acc + parseInt(transfer.costOnLine.replace(/[^0-9]/g, '')), 0);

      return {
        startStation,
        endStation,
        totalTransfers: transfers.length - 1, // 첫 번째 구간은 환승이 아니므로 1을 빼줌
        paths: [
          {
            totalTime: ShortestPathModel.formatTime(distances[endStation]),
            totalCost: ShortestPathModel.formatCost(totalCost),
            segments: transfers,
          },
        ],
      };
    } catch (error) {
      throw new Error('Failed to calculate shortest path.');
    }
  }
}

module.exports = ShortestPathModel;
