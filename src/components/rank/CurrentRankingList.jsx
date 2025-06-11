import RankingList from "./RankingList.jsx";
import React from "react";
import '../../styles/rank/CurrentRankingList.css';

export default function CurrentRankingList({currentSeasonName, rankings, rankUpdatedTime}) {
    return (
        <div className="ranking-wrapper">
                <span className="current-season-name">{currentSeasonName}</span>
                <div className="ranking-header">
                    실시간 랭킹
                    {rankUpdatedTime === null ? '' :
                        <span className="ranking-time">{rankUpdatedTime} 기준</span>}
                </div>
                <RankingList data={rankings} highlightTop3/>
        </div>
    )
}