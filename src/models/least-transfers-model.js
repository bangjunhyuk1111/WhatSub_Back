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
      const visited = new Map(); // visited를 Map으로 사용하여 더 정확하게 추적

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
        const current = priorityQueue.shift();
        const { station, totalTime, transferCount, lineNumber, path } = current;
        const visitKey = `${station}_${lineNumber}`;

        // 방문 처리: 해당 station과 lineNumber에 대한 경로가 이미 더 좋은 경로로 방문되었는지 확인
        if (visited.has(visitKey)) {
          const prev = visited.get(visitKey);
          if (prev.transferCount < transferCount || (prev.transferCount === transferCount && prev.totalTime <= totalTime)) {
            continue;
          }
        }

        visited.set(visitKey, { transferCount, totalTime });

        // 목적지에 도달한 경우, 경로를 저장
        if (station === endStation) {
          paths[endStation].push({ ...current });
          continue;
        }

        // 이웃 노드를 탐색
        this.graph[station].forEach(({ toNode, timeWeight, costWeight, lineNumber: nextLine }) => {
          const isTransfer = lineNumber !== null && lineNumber !== nextLine ? 1 : 0;
          const newTransferCount = transferCount + isTransfer;
          const newTotalTime = totalTime + timeWeight;

          // 경로 큐에 새로운 경로 추가
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

        // 우선순위 큐를 최소 환승, 최소 시간 기준으로 정렬
        priorityQueue.sort((a, b) => {
          if (a.transferCount === b.transferCount) {
            return a.totalTime - b.totalTime;
          }
          return a.transferCount - b.transferCount;
        });
      }

      // 목적지에 도달할 수 없으면 예외 처리
      if (!paths[endStation] || paths[endStation].length === 0) {
        throw new Error('No paths found between the specified stations.');
      }

      // 최소 환승 경로를 찾음
      const minTransfers = Math.min(...paths[endStation].map((p) => p.transferCount));

      // 최소 환승 경로들만 필터링
      const filteredPaths = paths[endStation].filter((p) => p.transferCount === minTransfers);

      // 경로가 잘 나오는지 확인하기 위한 디버깅 로그
      console.log('Filtered Paths:', filteredPaths);

      // 경로 합치기
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

      // 최소 환승 경로들 반환
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
