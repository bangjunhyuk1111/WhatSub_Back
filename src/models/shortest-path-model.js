const db = require('../../config/database.js');
const GraphModel = require('./graph-model');

/**
 * ShortestPathModel
 * 모델: 최단 경로를 계산하는 알고리즘 및 데이터 처리
 */
class ShortestPathModel {
  constructor() {
    this.graph = {}; // 그래프 데이터를 저장
    this.stationInfo = {}; // 역 정보를 저장
  }

  /**
   * 그래프와 역 정보를 초기화합니다.
   * - 그래프는 각 역 간의 연결 정보를 포함
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
   * 초를 시/분/초 형식으로 변환
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}시간 ` : ''}${minutes > 0 ? `${minutes}분 ` : ''}${remainingSeconds}초`;
  }

  /**
   * 비용을 한국 통화 형식으로 변환
   */
  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  /**
   * 최단 경로를 계산합니다.
   * - 다익스트라 알고리즘을 사용
   */
  async calculateShortestPath(startStation, endStation) {
    try {
      await this.buildGraphAndStationInfo();

      const distances = {}; // 각 역까지의 최소 거리
      const previous = {}; // 경로 추적 정보
      const visited = new Set(); // 방문한 역
      const priorityQueue = []; // 우선순위 큐

      // 초기 거리 설정
      Object.keys(this.graph).forEach((node) => {
        distances[node] = Infinity;
      });
      distances[startStation] = 0;

      priorityQueue.push({ station: startStation, time: 0 });

      // 다익스트라 알고리즘
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

      // 경로 추적
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

      // 환승 정보 구성
      const transfers = [];
      rawPath.forEach((segment) => {
        const lastTransfer = transfers[transfers.length - 1];
        if (lastTransfer && lastTransfer.lineNumber === segment.lineNumber) {
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
      });

      transfers.forEach((transfer) => {
        transfer.timeOnLine = ShortestPathModel.formatTime(transfer.timeOnLine);
        transfer.costOnLine = ShortestPathModel.formatCost(transfer.costOnLine);
      });

      // 총 비용 계산
      const totalCost = transfers.reduce((acc, transfer) => acc + parseInt(transfer.costOnLine.replace(/[^0-9]/g, '')), 0);

      return {
        startStation,
        endStation,
        totalTransfers: transfers.length - 1,
        paths: [
          {
            totalTime: ShortestPathModel.formatTime(distances[endStation]),
            totalCost: ShortestPathModel.formatCost(totalCost),
            segments: transfers,
          },
        ],
      };
    } catch (error) {
      console.error('❌ 최단 경로 계산 중 오류 발생:', error.message);
      throw new Error('최단 경로 계산에 실패했습니다.');
    }
  }
}

module.exports = ShortestPathModel;
