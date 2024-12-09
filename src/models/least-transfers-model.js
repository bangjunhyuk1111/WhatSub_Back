const db = require('../../config/database.js');
const GraphModel = require('./graph-model');

/**
 * LeastTransfersModel
 * 모델: 최소 환승 경로 계산 알고리즘 처리
 */
class LeastTransfersModel {
  constructor() {
    this.graph = {}; // 그래프 데이터를 저장
    this.stationInfo = {}; // 역 정보를 저장
  }

  /**
   * 그래프 및 역 정보를 초기화
   * - 그래프는 역 간 연결 정보를 포함
   * - 역 정보에는 화장실 및 상점 개수가 포함
   */
  async buildGraphAndStationInfo() {
    if (Object.keys(this.graph).length > 0 && Object.keys(this.stationInfo).length > 0) {
      return; // 이미 초기화된 경우 다시 초기화하지 않음
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
      console.error('❌ 그래프 및 역 정보 초기화 중 오류 발생:', error.message);
      throw new Error('그래프 및 역 정보를 초기화하는 데 실패했습니다.');
    }
  }

  /**
   * 시간을 시/분/초 형식으로 변환
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return hours > 0
      ? `${hours}시간 ${minutes}분 ${remainingSeconds}초`
      : `${minutes}분 ${remainingSeconds}초`;
  }

  /**
   * 비용을 한국 통화 형식으로 변환
   */
  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  /**
   * 최소 환승 경로를 계산
   * @param {number} startStation - 출발역 번호
   * @param {number} endStation - 도착역 번호
   * @returns {Object} 최소 환승 경로 데이터
   */
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
        throw new Error('출발역과 도착역 사이에 경로가 없습니다.');
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
      console.error('❌ 최소 환승 경로 계산 중 오류 발생:', error.message);
      throw new Error('최소 환승 경로를 계산하는 데 실패했습니다.');
    }
  }
}

module.exports = LeastTransfersModel;
