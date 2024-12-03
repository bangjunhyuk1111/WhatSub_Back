const newsService = require('../services/news-service'); // Service 호출

exports.getNews = async (req, res) => {
    try {
        const newsData = await newsService.getNews(); // Service에서 뉴스 데이터 가져오기

        if (!newsData || newsData.length === 0) {
            // 뉴스 데이터가 없을 경우 404 상태 코드 반환
            return res.status(404).json({ message: 'No news found' });
        }

        res.status(200).json(newsData); // 뉴스 데이터가 있을 경우 200 상태 코드 반환
    } catch (err) {
        console.error(err);

        // 서버 오류 발생 시 500 상태 코드 반환
        res.status(500).json({ message: 'Error fetching news data', error: err.message });
    }
};