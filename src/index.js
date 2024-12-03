// 1. 표준 라이브러리
const express = require('express');

// 2. 외부 라이브러리
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');

// 3. 내부 모듈
dotenv.config();
const db = require('../config/database.js');

// 라우터 선언
const graphRoutes = require('./routes/graph-route'); //그래프
const shortestPathRoute = require('./routes/shortest-path-route'); //최소 시간
const cheapestPathRoutes = require('./routes/cheapest-path-route'); //최소 비용
const leastTransfersRoutes = require('./routes/least-transfers-route'); //최소 환승
const combinedPathRoute = require('./routes/combined-path-route'); //뉴스

// Express 앱 설정
const app = express();
app.set('port', process.env.PORT || 8000);

if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy');
  app.use(morgan('combined'));
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: false,
    })
  );
} else {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 라우터
app.get('/', async (req, res) => {
  res.send('라우터 작동함');
});

app.use('/graph', graphRoutes); // 그래프 생성 확인 라우터
app.use('/cheapest-path', cheapestPathRoutes); // 최소요금 경로 라우터
app.use('/shortest-path', shortestPathRoute); // 최단거리 경로 라우터
app.use('/least-transfers-path', leastTransfersRoutes); //최소환승 경로 라우터
app.use('/combined-path', combinedPathRoute); // 통합된 라우터

// 404 에러 처리 미들웨어
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

// 에러 처리 미들웨어
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    message: error.message,
    status: error.status || 500,
  });
});

// 서버 시작
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
