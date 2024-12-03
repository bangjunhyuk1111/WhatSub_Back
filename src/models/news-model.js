const db = require('../../config/database'); // DB 연결

exports.getAllNews = async () => {
    try {
        // 'News' 테이블에서 모든 뉴스 데이터를 조회
        const [results] = await db.query('SELECT * FROM News');
        return results; // 조회된 데이터를 반환
    } catch (err) {
        console.error('Error in model layer:', err);
        throw new Error('Database query failed');
    }
};