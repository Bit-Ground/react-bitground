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

    const {user} = useAuth();

    // 실시간 랭킹 로딩
    useEffect(() => {
        const fetchRankings = async () => {
            try {
                const response = await api.get(`/rank/current`);
                setRankings(Array.isArray(response.data) ? response.data : []);
                const timestamp = response.data[0]?.updatedAt;
                const date = new Date(timestamp);
                setRankUpdatedTime(`${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}시`);

                // 유저 자산 목록 설정
                const assets = response.data.map(item => item.totalValue);
                setUserAssets(assets);

                // 현재 유저 자산 설정
                const userRank = response.data.find(item => item.userId === user.id);
                if (userRank) {
                    setCurrentUserAsset(userRank.totalValue);
                }

            } catch (error) {
                console.error('실시간 랭킹 로딩 실패:', error);
                setError('실시간 랭킹 데이터를 불러오지 못했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchRankings();
    }, [user.id]);

    // 시즌 정보 로딩
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await api.get('/seasons');

                // 필요한 필드만 추출
                const seasonData = response.data
                    .filter(season => season.status !== 'PENDING') // 현재 시즌 제외
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

                // 새 맵 객체를 생성하여 기존 데이터와 새 데이터를 합침
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

    if (loading) return <div className="ranking-page">
        <Loading/>
    </div>;
    if (error) return <div className="ranking-page">
        <div className="ranking-container">에러: {error}</div>
    </div>;

    return (
        <div className="ranking-page">
            {/* 실시간 랭킹 */}
            <CurrentRankingList rankUpdatedTime={rankUpdatedTime}
                                currentSeasonName={currentSeasonName}
                                rankings={rankings}
            />

            {/* 분포도 + 지난시즌 랭킹 */}
            <div className="content-wrapper">
                <DistributionChart userAssets={userAssets} currentUserAsset={currentUserAsset}/>
                <PastRankingList pastLoading={pastLoading}
                                 pastRankingsMap={pastRankingsMap}
                                 seasons={seasons}
                                 selectedSeason={selectedSeason}
                                 setSelectedSeason={setSelectedSeason}
                />
            </div>
        </div>
    );
};
