import RankingList from "./RankingList.jsx";
import React, { useEffect, useState } from 'react';
import '../../styles/rank/CurrentRankingList.css';

function formatTimeWithAmPm(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const ampm = hours < 12 ? '오전' : '오후';
    return `${month}월 ${day}일 ${ampm} ${displayHours}시`;
}

export default function CurrentRankingList({currentSeasonName, rankings, rankUpdatedTime, detailedRankings}) {
    const [countdownText, setCountdownText] = useState('');


    useEffect(() => {
        // 기존처럼 업데이트 시간이 있으면 그 기준으로, 없으면 현재 시간 기준으로 처리
        const baseTime = rankUpdatedTime ? new Date(rankUpdatedTime) : new Date();

        const interval = setInterval(() => {
            const now = new Date();
            const nextHour = new Date(baseTime);
            nextHour.setHours(baseTime.getHours() + 1, 0, 0, 0);

            const diffMs = nextHour - now;
            const minutesLeft = Math.max(0, Math.floor(diffMs / 60000));

            const formattedTime = formatTimeWithAmPm(baseTime);
            const text = `📌 ${formattedTime} 기준\n⏳ 다음 갱신까지 ${minutesLeft}분 남았습니다.`;

            setCountdownText(text);
        }, 1000);

        return () => clearInterval(interval);
    }, [rankUpdatedTime]);

    return (
        <div className="ranking-wrapper">
                <span className="current-season-name">{currentSeasonName}</span>
            <div className="ranking-header">
                실시간 랭킹
                <pre className="ranking-time">{countdownText}</pre> {/* 무조건 출력 */}
            </div>
            <RankingList
                data={rankings}
                highlightTop3={true}
                detailedData={detailedRankings} // ← 전달
                currentSeasonName={currentSeasonName}
            />
        </div>
    )
}