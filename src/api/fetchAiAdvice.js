import api from './axiosConfig'; // 기존 axios 인스턴스 임포트

/**
 * 특정 사용자 및 시즌에 대한 AI 조언을 백엔드로부터 가져옵니다.
 *
 * @param {number} userId - 사용자 ID.
 * @param {number} seasonId - 시즌 ID.
 * @returns {Promise<object | null>} AI 조언 데이터 (AiAdviceDto) 또는 null.
 */
export const fetchAiAdvice = async (userId, seasonId) => {
    try {
        const response = await api.get(`/api/v1/advice/user/${userId}/season/${seasonId}`);
        // 응답 데이터 구조에 따라 필요하면 여기서 추가 가공
        return response.data;
    } catch (error) {
        console.error(`AI 조언 불러오기 실패 (User ID: ${userId}, Season ID: ${seasonId}):`, error);
        return null;
    }
};
