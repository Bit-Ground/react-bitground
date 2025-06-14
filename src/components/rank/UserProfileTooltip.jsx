import React from 'react';
import '../../styles/rank/UserProfileTooltip.css';

export default function UserProfileTooltip({ user, position }) {
    if (!user) return null;

    return (
        <div className="user-tooltip" style={{ top: position.y, left: position.x }}>
            <img src={user.profileImage} alt="프로필" className="tooltip-avatar"/>
            <div className="tooltip-info">
                <div className="nickname">{user.nickname}</div>
                {/*<div>현재 수익률: {user.currentReturnRate}%</div>*/}
                <div>최고 티어: {user.highestTier}</div>
                <div className="past-tiers">
                    지난 시즌:
                    {user.pastTiers.slice(0, 5).map((tier, idx) => (
                        <span key={idx} className={`tier-badge tier-${tier}`}>{tier}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}