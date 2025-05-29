import React, { useEffect, useState } from 'react';
import api from "../../api/axiosConfig.js";
import RankingList from './RankingList.jsx';
import SeasonSelector from './SeasonSelector.jsx';
import DistributionChart from './DistributionChart.jsx';
import '../../styles/rank/Ranking.css';
import '../../styles/rank/ranking-list.css';
import '../../styles/rank/distribution-chart.css';

const Ranking = () => {
    const [rankings, setRankings] = useState([]);
    const [pastRankings, setPastRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pastLoading, setPastLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);

    const currentSeasonId = 2; // ✅ 현재 시즌 가정
    const now = new Date();
    const currentTime = `${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const seasons = [
        { value: 1, label: '시즌 1' },
        { value: 2, label: '시즌 2' },
        { value: 3, label: '시즌 3' },
        { value: 4, label: '시즌 4' }
    ];

    // ✅ 실시간 랭킹 로딩
    useEffect(() => {
        const fetchRankings = async () => {
            try {
                console.log('📦 실시간 랭킹 요청:', `/rankings/${currentSeasonId}`);
                const response = await api.get(`/rankings/${currentSeasonId}`);
                console.log('✅ 응답 데이터:', response.data);
                setRankings(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('❌ 실시간 랭킹 로딩 실패:', error);
                setError('실시간 랭킹 데이터를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [currentSeasonId]);

    // ✅ 과거 시즌 랭킹 로딩
    useEffect(() => {
        const fetchPast = async () => {
            setPastLoading(true);
            if (selectedSeason === currentSeasonId) {
                setPastRankings([]); // 현재 시즌이면 비우기
                setPastLoading(false);
                return;
            }

            try {
                const response = await api.get(`/rankings/season/${selectedSeason}`);
                setPastRankings(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('과거 시즌 랭킹 로딩 실패:', err);
                setPastRankings([]);
            } finally {
                setPastLoading(false);
            }
        };
        fetchPast();
    }, [selectedSeason]);

    if (loading) return <div className="ranking-wrapper"><div className="ranking-container">로딩 중...</div></div>;
    if (error) return <div className="ranking-wrapper"><div className="ranking-container">에러: {error}</div></div>;

    return (
        <div className="ranking-page">
            {/* 실시간 랭킹 */}
            <div className="ranking-wrapper">
                <div className="ranking-container">
                    <div className="ranking-header">
                        실시간 랭킹 <span className="ranking-time">{currentTime} 기준</span>
                    </div>
                    <RankingList data={rankings} highlightTop3 />
                </div>
            </div>

            {/* 분포도 + 지난시즌 랭킹 */}
            <div className="content-wrapper">
                <DistributionChart />

                <div className="past-ranking-wrapper">
                    <div className="section-header">
                        <span className="section-title">지난시즌 랭킹</span>
                        <SeasonSelector
                            seasonList={seasons}
                            selectedSeason={selectedSeason}
                            onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        />
                    </div>

                    {/* 지난 시즌 선택한 게 현재 시즌이면 안내 메시지 */}
                    {selectedSeason === currentSeasonId ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            현재 시즌입니다. 지난 시즌 랭킹이 없습니다.
                        </div>
                    ) : pastLoading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
                    ) : (
                        <RankingList data={pastRankings} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Ranking;
