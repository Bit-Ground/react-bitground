import React, { useEffect, useState } from 'react';
import api from "../api/axiosConfig.js";
import './Ranking.css';

const Ranking = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const seasonId = 1;

    // 현재 시간 표시용 (한국 시간 기준
    const currentTime = new Date().toLocaleString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await api.get(`/rankings/${seasonId}`);
                if (Array.isArray(response?.data)) {
                    setRankings(response.data);
                } else {
                    throw new Error('데이터 형식이 올바르지 않습니다.');
                }
            } catch (error) {
                console.error('랭킹 데이터를 불러오지 못했습니다:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, []);

    if (loading) return <div className="ranking-wrapper"><div className="ranking-container">로딩 중...</div></div>;
    if (error) return <div className="ranking-wrapper"><div className="ranking-container">에러: {error}</div></div>;
    if (!rankings.length) return <div className="ranking-wrapper"><div className="ranking-container">랭킹 데이터가 없습니다.</div></div>;

    return (
        <div className="ranking-wrapper">
            <div className="ranking-container">
                <div className="ranking-header">
                    실시간 랭킹 <span className="ranking-time">{currentTime} 기준</span>
                </div>
                <div className="ranking-list">
                    {rankings.map((item, index) => {
                        // 필수 데이터 검증
                        const userId = item?.userId || '알 수 없음';
                        const totalValue = Number(item?.totalValue || 0);

                        return (
                            <div
                                key={`${userId}-${index}`}
                                className={`ranking-item ${index < 3 ? 'top3' : ''}`}
                            >
                                <div className="rank-position">
                                    {index + 1}
                                </div>
                                <div className="shield-icon">
                                    🛡️
                                </div>
                                <div className="user-info">
                                    {userId}
                                </div>
                                <div className="amount">
                                    {totalValue.toLocaleString()}원
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Ranking;
