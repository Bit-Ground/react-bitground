import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

export default function AssetSummary() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await api.get('/orders'); // ✅ 쿠키 기반 로그인 유저 데이터 가져옴
                setData(res.data);
            } catch (err) {
                console.error('자산 정보 로딩 실패:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAssets();
    }, []);

    if (loading) return <div>로딩 중...</div>;
    if (!data) return <div>데이터 없음</div>;

    const {
        cash = 0,
        totalValue = 0,
        totalBuy = 0,
        totalProfit = 0,
        totalProfitRate = 0
    } = data;

    return (
        <div className="asset-summary">
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">보유 KRW</span>
                    <span className="bigvalue">{cash.toLocaleString()} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 보유자산</span>
                    <span className="bigvalue">{totalValue.toLocaleString()} <small>KRW</small></span>
                </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 매수</span>
                    <span className="value">{totalBuy.toLocaleString()} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가손익</span>
                    <span
                        className={`value ${
                            totalProfit > 0 ? 'positive' : totalProfit < 0 ? 'negative' : ''
                        }`}
                    >
                        {totalProfit > 0 ? '+' : ''}
                        {totalProfit.toLocaleString()} <small>KRW</small>
                    </span>
                </div>
            </div>

            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 평가</span>
                    <span className="value">{totalValue.toLocaleString()} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가수익률</span>
                    <span
                        className={`value ${
                            totalProfitRate > 0 ? 'positive' : totalProfitRate < 0 ? 'negative' : ''
                        }`}
                    >
                        {totalProfitRate > 0 ? '+' : ''}
                        {totalProfitRate.toFixed(2)}%
                    </span>
                </div>
            </div>

            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">주문가능</span>
                    <span className="value">{cash.toLocaleString()} <small>KRW</small></span>
                </div>
            </div>
        </div>
    );
}
