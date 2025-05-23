import React, { useEffect, useState } from 'react';
import api from "../api/axiosConfig.js";
import './Ranking.css';
import bronzeLine from '../assets/images/bronze_line.png';

const Ranking = () => {
    const [rankings, setRankings] = useState([]);
    const [pastRankings, setPastRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pastLoading, setPastLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1); // 현재 시즌이 1이라고 가정
    const seasonId = 1;

    const currentTime = new Date().toLocaleString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    // 시즌 목록 (예시)
    const seasons = [
        { value: 1, label: 'Season 1' },
        { value: 2, label: 'Season 2' },
        { value: 3, label: 'Season 3' },
        { value: 4, label: 'Season 4' }
    ];

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

    useEffect(() => {
        const fetchPastRankings = async () => {
            setPastLoading(true);
            try {
                // 선택된 시즌의 랭킹 데이터를 가져옵니다
                const response = await api.get(`/rankings/season/${selectedSeason}`);
                if (Array.isArray(response?.data)) {
                    setPastRankings(response.data);
                }
            } catch (error) {
                console.error('과거 시즌 랭킹 데이터를 불러오지 못했습니다:', error);
            } finally {
                setPastLoading(false);
            }
        };

        // 현재 시즌이 아닐 때만 과거 데이터를 가져옵니다
        if (selectedSeason !== seasonId) {
            fetchPastRankings();
        } else {
            setPastRankings(rankings);
            setPastLoading(false);
        }
    }, [selectedSeason, rankings]);

    const handleSeasonChange = (event) => {
        setSelectedSeason(Number(event.target.value));
    };

    if (loading) return <div className="ranking-wrapper"><div className="ranking-container">로딩 중...</div></div>;
    if (error) return <div className="ranking-wrapper"><div className="ranking-container">에러: {error}</div></div>;
    if (!rankings.length) return <div className="ranking-wrapper"><div className="ranking-container">랭킹 데이터가 없습니다.</div></div>;

    return (
        <div className="ranking-page">
            <div className="ranking-wrapper">
                <div className="ranking-container">
                    <div className="ranking-header">
                        실시간 랭킹 <span className="ranking-time">{currentTime} 기준</span>
                    </div>
                    <div className="ranking-list">
                        {rankings.map((item, index) => {
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
                                        <img src={bronzeLine} alt="브론즈 라인" style={{width:'30px',height:'30px'}}/>
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

            <div className="content-wrapper">
                <div className="distribution-wrapper">
                    <div className="section-header">
                        <div className="section-title">분포도</div>
                    </div>
                    <div style={{ height: 'calc(100% - 50px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        분포도 차트가 들어갈 영역
                    </div>
                </div>

                <div className="past-ranking-wrapper">
                    <div className="section-header">
                        <div className="section-title">지난시즌 랭킹</div>
                        <select
                            className="season-select"
                            value={selectedSeason}
                            onChange={handleSeasonChange}
                        >
                            {seasons.map(season => (
                                <option key={season.value} value={season.value}>
                                    {season.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="ranking-list">
                        {pastLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
                        ) : (
                            (pastRankings.length ? pastRankings : rankings).map((item, index) => {
                                const userId = item?.userId || '알 수 없음';
                                const totalValue = Number(item?.totalValue || 0);

                                return (
                                    <div
                                        key={`past-${userId}-${index}`}
                                        className="ranking-item"
                                    >
                                        <div className="rank-position">
                                            {index + 1}
                                        </div>
                                        <div className="shield-icon">
                                            <img src={bronzeLine} alt="브론즈 라인" style={{width:'30px',height:'30px'}}/>
                                        </div>
                                        <div className="user-info">
                                            {userId}
                                        </div>
                                        <div className="amount">
                                            {totalValue.toLocaleString()}원
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ranking;
