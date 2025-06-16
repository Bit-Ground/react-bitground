import React , {useState} from 'react';
import bronzeLine from '../../assets/images/bronze_line.png';
import silverLine from '../../assets/images/silver_line.png';
import goldLine from '../../assets/images/gold_line.png';
import platinumLine from '../../assets/images/platinum_line.png';
import diamondLine from '../../assets/images/diamond_line.png';
import masterLine from '../../assets/images/master_line.png';
import grandmasterLine from '../../assets/images/grandmaster_line.png';
import '../../styles/rank/RankingList.css';
import UserProfileTooltip from "./UserProfileTooltip.jsx";

// 티어 번호 (1 ~ 7) → 이미지 매핑
    const tierImageMap = {
    1: bronzeLine,
    2: silverLine,
    3: goldLine,
    4: platinumLine,
    5: diamondLine,
    6: masterLine,
    7: grandmasterLine
};


// 랭킹 리스트 컴포넌트
export default function RankingList({ data, highlightTop3 = false, detailedData = [],currentSeasonName, disableHover = false}) {
    const [hoverUser, setHoverUser] = useState(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e, item) => {
        const x = e.clientX + 20;
        const y = e.clientY + 20;

        const detailed = detailedData.find((u) => u.userId === item.userId);
        const tooltipUser = {
            profileImage: item.profileImage,
            nickname: item.name,
            currentReturnRate: detailed?.currentReturnRate ?? 0,
            highestTier: detailed?.highestTier ?? null,
            pastTiers: detailed?.pastTiers ?? [],
            pastSeasonTiers: item.pastSeasonTiers ?? []
        };

        setHoverUser(tooltipUser);
        setPosition({ x, y });
    };

    const handleMouseLeave = () => {
        setHoverUser(null);
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
                        onMouseMove={(e) => handleMouseMove(e, item)}
                        onMouseLeave={handleMouseLeave}
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
                <UserProfileTooltip
                    user={hoverUser}
                    position={position}
                    currentSeasonName={currentSeasonName}
                    isPastRanking={true}
                />
            )}
        </div>
    );
}