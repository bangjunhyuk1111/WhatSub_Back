const { StatusCodes } = require('http-status-codes');
const newsService = require('../services/news-service'); // Service 호출

/**
 * NewsController
 * 컨트롤러: 뉴스 데이터를 처리하고 응답을 반환
 */
const NewsController = {
  /**
   * GET /news
   * 모든 뉴스 데이터를 가져와 응답
   * @param {Object} req - 요청 객체
   * @param {Object} res - 응답 객체
   */
  async getNews(req, res) {
    try {
      // Service에서 뉴스 데이터 가져오기
      const newsData = await newsService.getNews();

      // 뉴스 데이터가 없는 경우 404 상태 반환
      if (!newsData || newsData.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          status: StatusCodes.NOT_FOUND,
          message: '뉴스를 찾을 수 없습니다.',
        });
      }

      // 뉴스 데이터가 있는 경우 200 상태 반환
      return res.status(StatusCodes.OK).json(newsData);
    } catch (error) {
      console.error('❌ 뉴스 데이터를 가져오는 중 오류 발생:', error.message);

      // 서버 오류 발생 시 500 상태 반환
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: '뉴스 데이터를 가져오는 중 오류가 발생했습니다.',
        error: error.message,
      });
    }
  },
};

module.exports = NewsController;
