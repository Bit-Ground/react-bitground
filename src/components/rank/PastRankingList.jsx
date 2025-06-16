import LoadingSpinner from "../LoadingSpinner.jsx";
import React , {useState} from 'react';
import RankingList from "./RankingList.jsx";
import UserProfileTooltip from "./UserProfileTooltip.jsx";
import '../../styles/rank/PastRankingList.css';

export default function PastRankingList({seasons, pastRankingsMap, pastLoading, pastDetailedRankingsMap,selectedSeason, setSelectedSeason}) {
    const [hoverUser, setHoverUser] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseEnter = (e, item) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({ x: rect.right + 10, y: rect.top });

        // 유저 정보 최소 구성
        const tooltipUser = {
            profileImage: item.profileImage,
            nickname: item.name,
            highestTier: item.highestTier ?? item.tier, // 수정된 라인
        };

        setHoverUser(tooltipUser);
    };

    const handleMouseLeave = () => {
        setHoverUser(null);
    };
    return (
        <div className="past-ranking-wrapper">
            <div className="section-header">
                <div className="title-and-date-group">
                    <span className="section-title">지난시즌 랭킹</span>
                    <span className="season-date">
                           {seasons.find(s => s.id === selectedSeason)?.startAt?.substring(0, 10)} ~ {seasons.find(s => s.id === selectedSeason)?.endAt?.substring(0, 10)}
                        </span>
                </div>
                <select className="season-select" value={selectedSeason}
                        onChange={(e) => setSelectedSeason(Number(e.target.value))}>
                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>
                            {season.name}
                        </option>
                    ))}
                </select>
            </div>
            {pastLoading ? <LoadingSpinner/> :
                <RankingList
                    data={pastRankingsMap[selectedSeason] || []}
                    highlightTop3
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    currentSeasonName={seasons.find(s => s.id === selectedSeason)?.name}
                    detailedData={pastDetailedRankingsMap[selectedSeason] || []} // 이거 추가
                />}
            {hoverUser && (
                <UserProfileTooltip
                    user={hoverUser}
                    position={position}
                    isPastRanking={true}
                />
            )}
        </div>
    );
}