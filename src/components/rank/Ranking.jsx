import React, { useEffect, useState } from 'react';
import api from "../../api/axiosConfig.js";
import RankingList from './RankingList.jsx';
import SeasonSelector from './SeasonSelector.jsx';
import DistributionChart from './DistributionChart.jsx';
import '../../style/Ranking.css';
import '../../style/ranking-list.css';
import '../../style/distribution-chart.css';

const Ranking = () => {
    const [rankings, setRankings] = useState([]);
    const [pastRankings, setPastRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pastLoading, setPastLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const seasonId = 1; // 현재 시즌 가정

    const currentTime = new Date().toLocaleString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });

    //시즌 목록 (추후에 백엔드 기능 대체) 아직 미구현
    const seasons = [
        { value: 1, label: 'Season 1' },
        { value: 2, label: 'Season 2' },
        { value: 3, label: 'Season 3' },
        { value: 4, label: 'Season 4' }
    ];

    //실시간 시즌 랭킹
    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await api.get(`/rankings/${seasonId}`);
                setRankings(Array.isArray(response.data) ? response.data : []);
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setError('랭킹 데이터를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, []);

    //이전 시즌 랭킹 불러오기
    useEffect(() => {
        const fetchPast = async () => {
            setPastLoading(true);
            try {
                if (selectedSeason !== seasonId) {
                    const response = await api.get(`/rankings/season/${selectedSeason}`);
                    setPastRankings(Array.isArray(response.data) ? response.data : []);
                } else {
                    setPastRankings(rankings);
                }
            } catch (err) {
                console.error('과거 시즌 랭킹 로딩 실패:', err);
            } finally {
                setPastLoading(false);
            }
        };
        fetchPast();
    }, [selectedSeason, rankings]);

    if (loading) return <div className="ranking-wrapper"><div className="ranking-container">로딩 중...</div></div>;
    if (error) return <div className="ranking-wrapper"><div className="ranking-container">에러: {error}</div></div>;

    return (
        // 실시간 랭킹 박스
        <div className="ranking-page">
            <div className="ranking-wrapper">
                <div className="ranking-container">
                    <div className="ranking-header">
                        실시간 랭킹 <span className="ranking-time">{currentTime} 기준</span>
                    </div>
                    {/*1~3위 강조표시*/}
                    <RankingList data={rankings} highlightTop3 />
                </div>
            </div>

            {/*분포도 + 지난시즌 랭킹 */}
            <div className="content-wrapper">
                
                {/*분포도 박스*/}
                <DistributionChart />
                
                {/*지난 시즌 랭킹 박스*/}
                <div className="past-ranking-wrapper">
                    <div className="section-header">
                        <span className="section-title">지난시즌 랭킹</span>
                        <SeasonSelector
                            seasonList={seasons}
                            selectedSeason={selectedSeason}
                            onChange={(e) => setSelectedSeason(Number(e.target.value))}
                        />
                    </div>
                    
                    {/*지난 시즌 랭킹 리스트*/}
                    {pastLoading
                        ? <div style={{ textAlign: 'center', padding: '20px' }}>로딩 중...</div>
                        : <RankingList data={pastRankings} />}
                </div>
            </div>
        </div>
    );
};

export default Ranking;
