import React from 'react';
import bronzeLine from '../../assets/images/bronze_line.png';
import silverLine from '../../assets/images/silver_line.png';
import goldLine from '../../assets/images/gold_line.png';
import platinumLine from '../../assets/images/platinum_line.png';
import diamondLine from '../../assets/images/diamond_line.png';

// 티어 번호 (0~4) → 이미지 매핑
const tierImageMap = {
    0: bronzeLine,
    1: silverLine,
    2: goldLine,
    3: platinumLine,
    4: diamondLine,
};

// 랭킹 리스트 컴포넌트
const RankingList = ({ data, highlightTop3 = false }) => {
    return (
        <div className="ranking-list">
            {data.map((item, index) => {
                const userId = item?.userId ?? '알 수 없음';
                const totalValue = Number(item?.totalValue ?? 0);
                const tier = item?.tier ?? 0;
                const profileImage = item?.profileImage;
                const tierImg = tierImageMap[tier] || bronzeLine;

                return (
                    <div
                        key={`${userId}-${index}`}
                        className={`ranking-item ${highlightTop3 && index < 3 ? 'top3' : ''}`}
                    >
                        {/* 순위 숫자 */}
                        <div className="rank-position">{index + 1}</div>

                        {/* 등급 이미지 */}
                        <div className="shield-icon">
                            <img src={tierImg} alt={`티어 ${tier}`} style={{ width: '30px', height: '30px' }} />
                        </div>

                        {/* 유저 프로필 이미지 or 유저 ID */}
                        <div className="user-info">
                            {/*{profileImage ? (*/}
                            {/*    <img src={profileImage} alt="프로필" style={{ width: '28px', height: '28px', borderRadius: '50%', marginRight: '8px' }} />*/}
                            {/*) : null}*/}
                            {userId}
                        </div>

                        {/* 유저 자산 */}
                        <div className="amount">{totalValue.toLocaleString()}원</div>
                    </div>
                );
            })}
        </div>
    );
};

export default RankingList;
