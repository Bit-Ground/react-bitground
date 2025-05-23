import React from 'react';
import bronzeLine from '../assets/images/bronze_line.png'; // 기본 이미지

// 등급별 이미지 맵핑
const gradeImageMap = {
    bronze: bronzeLine,
    // silver, gold 등 나중에 추가 가능
};

//랭킹 리스트 컴포넌트
const RankingList = ({ data, highlightTop3 = false }) => {
    return (
        <div className="ranking-list">
            {data.map((item, index) => {
                const userId = item?.userId || '알 수 없음';
                const totalValue = Number(item?.totalValue || 0);
                const grade = (item?.grade || 'bronze').toLowerCase();
                const gradeImg = gradeImageMap[grade] || bronzeLine;

                return (
                    <div
                        key={`${userId}-${index}`}
                        className={`ranking-item ${highlightTop3 && index < 3 ? 'top3' : ''}`}
                    >
                        {/*순위 숫자*/}
                        <div className="rank-position">{index + 1}</div>
                        {/*등급 이미지 */}
                        <div className="shield-icon">
                            <img src={gradeImg} alt={`${grade} 라인`} style={{ width: '30px', height: '30px' }} />
                        </div>
                        {/*유저 아이디*/}
                        <div className="user-info">{userId}</div>
                        {/*유저 자산(3자리 콤마처리)*/}
                        <div className="amount">{totalValue.toLocaleString()}원</div>
                    </div>
                );
            })}
        </div>
    );
};

export default RankingList;
