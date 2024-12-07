const db = require('../../config/database'); // DB 연결

/**
 * 뉴스 데이터를 관리하는 Model
 */
exports.getAllNews = async () => {
  try {
    // 'News' 테이블에서 모든 뉴스 데이터를 조회
    const [results] = await db.query('SELECT * FROM News');
    return results; // 조회된 데이터를 반환
  } catch (err) {
    console.error('❌ 모델 계층에서 오류 발생:', err.message);
    throw new Error('데이터베이스 조회에 실패했습니다.');
  }
};
