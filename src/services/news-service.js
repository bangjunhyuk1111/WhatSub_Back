const newsModel = require('../models/news-model'); // Model 호출

exports.getNews = async () => {
    try {
        // Model에서 데이터를 가져와서 처리
        const newsData = await newsModel.getAllNews();
        return newsData; // Service에서 처리된 데이터 반환
    } catch (err) {
        console.error('Error in service layer:', err);
        throw new Error('Error in service layer');
    }
};