import React from 'react';
import '../../styles/rank/UserProfileTooltip.css';
import bronze from '../../assets/images/bronze.png';
import silver from '../../assets/images/silver.png';
import gold from '../../assets/images/gold.png';
import platinum from '../../assets/images/platinum.png';
import diamond from '../../assets/images/diamond.png';
import master from '../../assets/images/master.png';
import grandmaster from '../../assets/images/grandmaster.png';

//티어 번호 (1~7) 이미지
const tierLogoImageMap = {
    1: bronze,
    2: silver,
    3: gold,
    4: platinum,
    5: diamond,
    6: master,
    7: grandmaster
};

const tierNameMap = {
    1: 'Bronze',
    2: 'Silver',
    3: 'Gold',
    4: 'Platinum',
    5: 'Diamond',
    6: 'Master',
    7: 'Grandmaster'
};

export default function UserProfileTooltip({ user, position }) {
    if (!user) return null;

    const highestTier = user.highestTier;
    const highestTierImg = tierLogoImageMap[highestTier];

    return (
        <div className="user-tooltip" style={{ top: position.y, left: position.x }}>
            <img src={user.profileImage} alt="프로필" className="tooltip-avatar" />
            <div className="tooltip-info">
                <div className="nickname">{user.nickname}</div>

                <div className="highest-tier">
                    최고 티어:&nbsp;
                    {highestTierImg && (
                        <img
                            src={highestTierImg}
                            alt={`티어 ${highestTier}`}
                            className="tier-icon"
                        />
                    )}
                    &nbsp;{tierNameMap[highestTier]}
                </div>

                <div className="past-tiers">
                    지난 시즌:<br />
                    {user.pastSeasonTiers?.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="tier-row">
                            <img
                                src={tierLogoImageMap[item.tier]}
                                alt={`티어 ${item.tier}`}
                                className="tier-icon"
                            />
                            <span className="season-text">
            {item.seasonName}: {tierNameMap[item.tier]}
        </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}