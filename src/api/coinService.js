import axios from 'axios';

// Axios 인스턴스 생성
// vite.config.js에 설정한 프록시 규칙에 따라 '/api'로 시작하면
// 'http://localhost:8090'으로 리다이렉트됩니다.
const apiClient = axios.create({
    baseURL: '/api', // BASE_URL 대신 apiClient의 baseURL 사용
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. 모든 코인 정보 조회 (GET /api/coins)
export const fetchAllCoins = async () => {
    try {
        const response = await apiClient.get('/coins');
        return response.data;
    } catch (error) {
        console.error('Error fetching all coins:', error);
        return [];
    }
};

// 2. 거래대금 상위 5개 코인 조회 (GET /api/coins/high-trade-price)
export const fetchTop5HighTradePriceCoins = async () => {
    try {
        const response = await apiClient.get('/coins/high-trade-price');
        return response.data;
    } catch (error) {
        console.error('Error fetching top 5 high trade price coins:', error);
        return [];
    }
};

// 3. 상승폭 큰 종목 상위 5개 코인 조회 (GET /api/coins/price-increase)
export const fetchTop5PriceIncreaseCoins = async () => {
    try {
        const response = await apiClient.get('/coins/price-increase');
        return response.data;
    } catch (error) {
        console.error('Error fetching top 5 price increase coins:', error);
        return [];
    }
};

// 4. 하락폭 큰 종목 상위 5개 코인 조회 (GET /api/coins/price-decrease)
export const fetchTop5PriceDecreaseCoins = async () => {
    try {
        const response = await apiClient.get('/coins/price-decrease');
        return response.data;
    } catch (error) {
        console.error('Error fetching top 5 price decrease coins:', error);
        return [];
    }
};

// 5. 거래유의 종목 조회 (백엔드의 isWarning에 해당, 엔드포인트는 /coins/caution)
export const fetchWarningCoins = async () => {
    try {
        const response = await apiClient.get('/coins/caution');
        return response.data; // 불필요한 map 변환 제거
    } catch (error) {
        console.error('Error fetching warning coins:', error);
        return [];
    }
};

// 6. 투자주의 종목 조회 (백엔드의 isCaution에 해당, 엔드포인트는 /coins/alert)
export const fetchAlertCoins = async () => {
    try {
        const response = await apiClient.get('/coins/alert');
        return response.data; // 불필요한 map 변환 제거
    } catch (error) {
        console.error('Error fetching alert coins:', error);
        return [];
    }
};

// 7. 모든 코인 심볼 조회 (드롭다운 메뉴용)
export const fetchCoinSymbols = async () => {
    try {
        const response = await apiClient.get('/coin-symbols');
        return response.data;
    } catch (error) {
        console.error('Error fetching coin symbols:', error);
        return [];
    }
};

// 8. 특정 코인에 대한 AI 분석 결과 조회 (GET /api/coins/{symbol}/insight)
export const fetchCoinInsight = async (symbol) => {
    try {
        const response = await apiClient.get(`/coins/${symbol}/insight`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching AI insight for ${symbol}:`, error);
        return null; // 분석 실패 시 null 반환
    }
};