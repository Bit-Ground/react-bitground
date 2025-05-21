import axios from 'axios';

const BASE_URL = 'http://localhost:5173/api/news';

export const getNews = async (query, pageNum) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: { query, pageNum },
        });
        return response.data;
    } catch (error) {
        throw new Error('뉴스 데이터를 가져오는 데 실패했습니다.');
    }
};