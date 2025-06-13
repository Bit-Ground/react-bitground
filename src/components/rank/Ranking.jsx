import React, {useEffect, useState} from 'react';
import api from "../../api/axiosConfig.js";
import DistributionChart from './DistributionChart.jsx';
import '../../styles/rank/Ranking.css';
import {useAuth} from '../../auth/useAuth.js';
import Loading from "../Loading.jsx";
import PastRankingList from "./PastRankingList.jsx";
import CurrentRankingList from "./CurrentRankingList.jsx";

export default function Ranking() {
    const [pastRankingsMap, setPastRankingsMap] = useState({});
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pastLoading, setPastLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(0);
    const [rankUpdatedTime, setRankUpdatedTime] = useState(null);
    const [seasons, setSeasons] = useState([]);
    const [currentSeasonName, setCurrentSeasonName] = useState('');
    const [currentUserAsset, setCurrentUserAsset] = useState(0);
    const [userAssets, setUserAssets] = useState([]);
    const [detailedRankings, setDetailedRankings] = useState([]);


    const {user} = useAuth();

    useEffect(() => {
        const fetchDetailedRankings = async () => {
            try {
                const response = await api.get('/rank/current/detailed');
                setDetailedRankings(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error('툴팁용 상세 랭킹 데이터 로딩 실패:', error);
            }
        };
        fetchDetailedRankings();
    }, []);

    // ✅ 상세 실시간 랭킹 로딩 (툴팁용 포함)
    useEffect(() => {
        const fetchDetailedRankings = async () => {
            try {
                const response = await api.get(`/rank/current/detailed`);
                const data = Array.isArray(response.data) ? response.data : [];

                setRankings(data);

                // 자산 정보
                const assets = data.map(item => item.totalValue);
                setUserAssets(assets);

                // 내 자산
                const userRank = data.find(item => item.userId === user.id);
                if (userRank) {
                    setCurrentUserAsset(userRank.totalValue);
                }

                // 업데이트 시간
                const timestamp = data[0]?.updatedAt;
                const date = new Date(timestamp);
                if (!isNaN(date.getTime())) {
                    setRankUpdatedTime(`${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시`);
                } else {
                    setRankUpdatedTime(null);
                }

            } catch (error) {
                console.error('상세 랭킹 로딩 실패:', error);
                setError('실시간 랭킹 데이터를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchDetailedRankings();
    }, [user.id]);

    // 시즌 정보 로딩
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await api.get('/seasons');

                const seasonData = response.data
                    .filter(season => season.status !== 'PENDING')
                    .map(season => ({
                        id: season.id,
                        name: season.name,
                        startAt: season.startAt,
                        endAt: season.endAt
                    }));

                if (response.data[0].status === 'PENDING') {
                    setCurrentSeasonName(response.data[0].name);
                }

                setSeasons(seasonData);
                if (response.data && response.data[0].status === 'PENDING' && response.data[1].status === 'COMPLETED') {
                    setSelectedSeason(response.data[1]?.id);
                } else {
                    console.warn('현재 시즌 정보가 없습니다.');
                }
            } catch (error) {
                console.error('현재 시즌 정보 로딩 실패:', error);
            }
        };
        fetchSeasons();
    }, []);

    // 과거 시즌 랭킹 로딩
    useEffect(() => {
        const fetchPast = async () => {
            if (!selectedSeason || pastRankingsMap[selectedSeason]) {
                setPastLoading(false);
                return;
            }

            setPastLoading(true);
            try {
                const response = await api.get(`/rank/${selectedSeason}`);
                const seasonData = Array.isArray(response.data) ? response.data : [];

                setPastRankingsMap(prevMap => ({
                    ...prevMap,
                    [selectedSeason]: seasonData
                }));
            } catch (err) {
                console.error('과거 시즌 랭킹 로딩 실패:', err);
            } finally {
                setPastLoading(false);
            }
        };
        fetchPast();
    }, [selectedSeason, pastRankingsMap]);

    if (loading) return <div className="ranking-page"><Loading/></div>;
    if (error) return <div className="ranking-page"><div className="ranking-container">에러: {error}</div></div>;

    return (
        <div className="ranking-page">
            <div className="ranking-live-wrapper">
                <CurrentRankingList
                    rankUpdatedTime={rankUpdatedTime}
                    currentSeasonName={currentSeasonName}
                    rankings={rankings}
                    detailedRankings={detailedRankings}
                />
            </div>
            <div className="ranking-content-wrapper">
                <DistributionChart userAssets={userAssets} currentUserAsset={currentUserAsset}/>
                <PastRankingList
                    pastLoading={pastLoading}
                    pastRankingsMap={pastRankingsMap}
                    seasons={seasons}
                    selectedSeason={selectedSeason}
                    setSelectedSeason={setSelectedSeason}
                />
            </div>
        </div>
    );
}