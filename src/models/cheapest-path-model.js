const db = require('../../config/database.js');
const GraphModel = require('./graph-model');

/**
 * ShortestCostModel
 * 모델: 가장 저렴한 경로를 계산하기 위한 비즈니스 로직을 처리
 */
class ShortestCostModel {
  constructor() {
    this.graph = {}; // 그래프 데이터를 저장할 객체
    this.stationInfo = {}; // 역 정보를 저장할 객체
  }

  /**
   * 그래프와 역 정보를 초기화합니다.
   * - Stations 테이블에서 화장실 및 상점 정보를 가져옵니다.
   */
  async buildGraphAndStationInfo() {
    if (Object.keys(this.graph).length > 0 && Object.keys(this.stationInfo).length > 0) {
      return; // 이미 데이터가 초기화된 경우 재실행하지 않음
    }

    try {
      const graphModel = new GraphModel();
      this.graph = await graphModel.buildGraph(); // 그래프 생성

      // 데이터베이스에서 역 정보를 가져오기
      const query = `
        SELECT 
          from_station_num AS stationNum,
          MAX(toilet_num) AS toiletNum,
          MAX(store_num) AS storeNum
        FROM Stations
        GROUP BY from_station_num
      `;
      const [rows] = await db.query(query);

      // 역 정보를 stationInfo 객체에 저장
      rows.forEach(({ stationNum, toiletNum, storeNum }) => {
        this.stationInfo[stationNum] = {
          toilet_num: toiletNum || 0,
          store_num: storeNum || 0,
        };
      });
    } catch (error) {
      throw new Error('그래프 및 역 정보를 초기화하는 데 실패했습니다.');
    }
  }

  /**
   * 비용을 한국어 통화 형식으로 포맷팅합니다.
   */
  static formatCost(cost) {
    return `${cost.toLocaleString('ko-KR')}원`;
  }

  /**
   * 시간을 시/분/초 형식으로 포맷팅합니다.
   */
  static formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours > 0 ? `${hours}시간 ` : ''}${minutes > 0 ? `${minutes}분 ` : ''}${remainingSeconds}초`;
  }

  /**
   * 시작역과 도착역 사이의 가장 저렴한 경로를 계산합니다.
   */
  async calculateShortestCostPath(startStation, endStation) {
    try {
      await this.buildGraphAndStationInfo(); // 데이터 초기화

      const costs = {}; // 각 역까지의 최소 비용
      const times = {}; // 각 역까지의 최소 시간
      const previous = {}; // 경로 추적 정보
      const visited = new Set(); // 방문한 역 집합
      const priorityQueue = []; // 우선순위 큐

      // 초기 비용과 시간 설정
      Object.keys(this.graph).forEach((node) => {
        costs[node] = Infinity;
        times[node] = Infinity;
      });
      costs[startStation] = 0;
      times[startStation] = 0;

      priorityQueue.push({ station: startStation, cost: 0 });

      // 다익스트라 알고리즘 실행
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

      // 경로 추적 및 포맷팅
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
          transfers.push({
            ...segment,
            toiletCount: this.stationInfo[segment.fromStation]?.toilet_num || 0,
            storeCount: this.stationInfo[segment.fromStation]?.store_num || 0,
          });
        }
      });

      transfers.forEach((transfer) => {
        transfer.timeOnLine = ShortestCostModel.formatTime(transfer.timeOnLine);
        transfer.costOnLine = ShortestCostModel.formatCost(transfer.costOnLine);
      });

      return {
        startStation,
        endStation,
        totalTransfers: transfers.length - 1, // 첫 번째 구간은 환승이 아니므로 1을 뺌
        paths: [{
          totalTime: ShortestCostModel.formatTime(times[endStation]),
          totalCost: ShortestCostModel.formatCost(costs[endStation]),
          segments: transfers,
        }],
      };
    } catch (error) {
      throw new Error('최소 시간 경로 계산에 실패했습니다.');
    }
  }
}

module.exports = ShortestCostModel;
