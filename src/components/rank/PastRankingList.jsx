import LoadingSpinner from "../LoadingSpinner.jsx";
import RankingList from "./RankingList.jsx";
import '../../styles/rank/PastRankingList.css';
import React from "react";

export default function PastRankingList({seasons, pastRankingsMap, pastLoading, selectedSeason, setSelectedSeason}) {
    return (

            <div className="past-ranking-wrapper">
                <div className="section-header">
                    <span className="section-title">지난시즌 랭킹</span>
                    <select className="season-select" value={selectedSeason}
                            onChange={(e) => setSelectedSeason(Number(e.target.value))}>
                        {seasons.map(season => (
                            <option key={season.id} value={season.id}>
                                {season.name}
                            </option>
                        ))}
                    </select>
                    <span className="season-date">
                           {seasons.find(s => s.id === selectedSeason)?.startAt?.substring(0, 10)} ~ {seasons.find(s => s.id === selectedSeason)?.endAt?.substring(0, 10)}
                       </span>
                </div>
                {pastLoading ? <LoadingSpinner/> :
                    <RankingList data={pastRankingsMap[selectedSeason] || []} highlightTop3/>}

            </div>
    );
}