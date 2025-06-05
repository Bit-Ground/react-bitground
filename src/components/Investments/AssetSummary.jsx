import { useEffect, useState, useContext, useMemo } from "react";
import api from "../../api/axiosConfig";
import { AuthContext } from "../../auth/AuthContext";
import { TickerContext } from "../../ticker/TickerProvider";

export default function AssetSummary({ seasonId }) {
    const { user } = useContext(AuthContext); // 로그인한 사용자 정보 가져오기
    const { tickerMap } = useContext(TickerContext); // 실시간 시세 정보 (WebSocket 기반)

    const [orders, setOrders] = useState([]); // 사용자의 주문 내역
    const [cash, setCash] = useState(0);      // 현재 보유 현금 (KRW)

    // seasonId나 user가 바뀔 때마다 자산 정보(API) 가져오기
    useEffect(() => {
        if (!seasonId || !user?.id) return;

        // 현금 가져오기
        api.get('/assets', { withCredentials: true })
            .then(res => setCash(res.data.cash || 0))
            .catch(() => setCash(0));

        // 주문 내역 가져오기
        api.get(`/orders/${seasonId}`, { withCredentials: true })
            .then(res => setOrders(res.data || []))
            .catch(() => setOrders([]));
    }, [seasonId, user]);

    // 총 매수금액, 총 평가금액, 평가손익, 수익률 계산 (매번 시세나 주문 바뀔 때 재계산됨)
    const {
        totalBuy,
        totalEval,
        profitAmount,
        profitRate,
        isPositive
    } = useMemo(() => {
        let totalBuy = 0;   // 총 매수금액
        let totalEval = 0;  // 총 평가금액

        // 💬 주문 내역 반복하며 총 매수 & 평가 계산
        orders.forEach(order => {
            const quantity = Number(order.amount || 0);           // 수량
            const avgPrice = Number(order.tradePrice || 0);       // 매수 평균가
            const marketCode = `KRW-${order.symbol}`;             // 마켓 코드 (예: KRW-BTC)
            const currentPrice = tickerMap[marketCode]?.price ?? 0; // 현재 시세 (없으면 0)

            totalBuy += quantity * avgPrice;       // 총 매수금액 += 수량 * 매수평균가
            totalEval += quantity * currentPrice;  // 총 평가금액 += 수량 * 현재시세
        });

        const profitAmount = totalEval - totalBuy; // 📈 평가손익 = 평가금액 - 매수금액
        const profitRate = totalBuy !== 0
            ? ((profitAmount / totalBuy) * 100).toFixed(2) // 수익률 계산
            : '0.00';

        const isPositive = profitAmount >= 0; // 수익 여부 판단

        return { totalBuy, totalEval, profitAmount, profitRate, isPositive };
    }, [orders, tickerMap]);

    // 화면 렌더링
    return (
        <div className="asset-summary">
            {/* 현금 및 총 자산 */}
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">보유 KRW</span>
                    <span className="bigvalue">{cash.toLocaleString()} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 보유자산</span>
                    <span className="bigvalue">{(cash + totalEval).toLocaleString()} <small>KRW</small></span>
                </div>
            </div>

            <div className="summary-divider"></div>

            {/* 매수 금액 & 손익 */}
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 매수</span>
                    <span className="value">{totalBuy.toLocaleString()} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가손익</span>
                    <span className={`value ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : ''}
                        {profitAmount.toLocaleString()} <small>KRW</small>
                    </span>
                </div>
            </div>

            {/* 평가 금액 & 수익률 */}
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 평가</span>
                    <span className="value">{totalEval.toLocaleString()} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가수익률</span>
                    <span className={`value ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : ''}
                        {profitRate}%
                    </span>
                </div>
            </div>

            {/* 주문 가능 금액 */}
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">주문가능</span>
                    <span className="value">{cash.toLocaleString()} <small>KRW</small></span>
                </div>
            </div>
        </div>
    );
}
