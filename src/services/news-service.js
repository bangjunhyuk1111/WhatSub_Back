const newsModel = require('../models/news-model'); // Model 호출

/**
 * 뉴스 데이터를 처리하는 Service
 */
exports.getNews = async () => {
  try {
    // Model에서 데이터를 가져와 처리
    const newsData = await newsModel.getAllNews();
    return newsData; // 처리된 데이터 반환
  } catch (err) {
    console.error('❌ 서비스 계층에서 오류 발생:', err.message);
    throw new Error('서비스 계층에서 오류가 발생했습니다.');
  }
};
