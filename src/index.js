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


//라우터


// 404 에러 처리 미들웨어
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
  });
  
// 데이터베이스 연결 테스트
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT NOW()');
    res.json({ message: 'Database connected', time: rows[0]['NOW()'] });
  } catch (error) {
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

// 서버 시작
const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});