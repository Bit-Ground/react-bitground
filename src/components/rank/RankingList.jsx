import React, { useEffect, useRef, useState } from 'react';
import api from '../../api/axiosConfig.js';
import bronzeLine from '../../assets/images/bronze_line.png';
import silverLine from '../../assets/images/silver_line.png';
import goldLine from '../../assets/images/gold_line.png';
import platinumLine from '../../assets/images/platinum_line.png';
import diamondLine from '../../assets/images/diamond_line.png';
import masterLine from '../../assets/images/master_line.png';
import grandmasterLine from '../../assets/images/grandmaster_line.png';
import '../../styles/rank/RankingList.css';
import UserProfileTooltip from "./UserProfileTooltip.jsx";

const tierImageMap = {
    1: bronzeLine,
    2: silverLine,
    3: goldLine,
    4: platinumLine,
    5: diamondLine,
    6: masterLine,
    7: grandmasterLine
};

export default function RankingList({
                                        data,
                                        highlightTop3 = false,
                                        currentSeasonName,
                                        disableHover = false,
                                        isPastRanking = false,
                                        seasonId = null
                                    }) {
    const [hoverUser, setHoverUser] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const tooltipRef = useRef(null);

    // 외부 클릭 감지해서 툴팁 닫기
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (tooltipRef.current && !tooltipRef.current.contains(e.target)) {
                setHoverUser(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleClick = async (e, item) => {
        e.stopPropagation();
        const x = e.clientX + 20;
        const y = e.clientY + 20;

        try {
            const targetSeasonId = isPastRanking ? seasonId : item.seasonId;
            const response = await api.get(`/rank/${targetSeasonId}/detailed`);
            const detailed = response.data.find(u => u.userId === item.userId);

            const tooltipUser = {
                profileImage: item.profileImage,
                nickname: item.name,
                currentReturnRate: detailed?.currentReturnRate ?? 0,
                highestTier: detailed?.highestTier ?? null,
                pastTiers: detailed?.pastTiers ?? [],
                pastSeasonTiers: detailed?.pastSeasonTiers ?? []
            };

            setPosition({ x, y });
            setHoverUser(tooltipUser);
        } catch (err) {
            console.error('툴팁 유저 정보 불러오기 실패:', err);
        }
    };

    return (
        <div className="ranking-list">
            {!data || data.length === 0 ? <div className="no-data">참여한 유저가 없습니다.</div> : ""}
            {data.map((item, index) => {
                const userId = item?.userId ?? 0;
                const name = item?.name ?? 'Unknown User';
                const totalValue = Number(item?.totalValue ?? 0);
                const tier = item?.tier ?? 0;
                const profileImage = item?.profileImage;
                const tierImg = tierImageMap[tier] || bronzeLine;
                const rank = item?.ranks ?? index + 1;

                return (
                    <div
                        key={`${userId}-${index}`}
                        className={`ranking-item ${highlightTop3 && index < 3 ? 'top3' : ''}`}
                        onClick={(e) => handleClick(e, item)}
                    >
                        <div className="rank-position">{rank}</div>
                        <div className="user-icon">
                            <img src={tierImg} alt={`티어 ${tier}`} className="tier-image" />
                            {profileImage && (
                                <img src={profileImage} alt="프로필" className="rank-profile-image" />
                            )}
                        </div>
                        <div className="user-info">{name}</div>
                        <div className="amount">{totalValue.toLocaleString()}원</div>
                    </div>
                );
            })}
            {!disableHover && hoverUser && (
                <div ref={tooltipRef}>
                    <UserProfileTooltip
                        user={hoverUser}
                        position={position}
                        currentSeasonName={currentSeasonName}
                        isPastRanking={isPastRanking}
                    />
                </div>
            )}
        </div>
    );
}