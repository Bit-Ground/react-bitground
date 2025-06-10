import { useEffect, useState, useContext, useMemo } from "react";
import api from "../../api/axiosConfig";
import { AuthContext } from "../../auth/AuthContext";
import { TickerContext } from "../../ticker/TickerProvider";

// 📌 숫자 포맷 함수 (소수점 자리수 지정 가능)
function formatNumber(value, digits = 0) {
    if (isNaN(value)) return '-';
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

export default function AssetSummary({ seasonId }) {
    const { user } = useContext(AuthContext);            // 🔑 로그인 사용자 정보
    const { tickerMap } = useContext(TickerContext);     // 📡 실시간 시세 정보

    const [orders, setOrders] = useState([]);            // 📘 주문 내역
    const [cash, setCash] = useState(0);                 // 💰 보유 현금

    // 🟢 자산 정보 요청 (시즌 ID나 사용자 바뀔 때)
    useEffect(() => {
        if (!seasonId || !user?.id) return;

        // 💵 현금 가져오기
        api.get('/assets', { withCredentials: true })
            .then(res => setCash(res.data.cash || 0))
            .catch(() => setCash(0));

        // 🧾 주문 내역 가져오기
        api.get(`/orders/${seasonId}`, { withCredentials: true })
            .then(res => setOrders(res.data || []))
            .catch(() => setOrders([]));
    }, [seasonId, user]);

    // 📊 주문 + 시세 기반 자산 계산
    const {
        totalBuy,        // 총 매수금액
        totalEval,       // 총 평가금액
        profitAmount,    // 평가손익
        profitRate,      // 수익률 (%)
        isPositive       // 수익 여부
    } = useMemo(() => {
        let totalBuy = 0;
        let totalEval = 0;

        // 🧮 매수 주문만 계산
        orders.forEach(order => {
            if (order.orderType !== 'BUY') return;

            const quantity = Number(order.amount || 0);
            const avgPrice = Number(order.tradePrice || 0);
            const marketCode = order.symbol; // 예: "KRW-BTC"
            const currentPrice = tickerMap?.[marketCode]?.price ?? 0;

            totalBuy += quantity * avgPrice;
            totalEval += quantity * currentPrice;
        });

        const profitAmount = totalEval - totalBuy;
        const profitRate = totalBuy !== 0
            ? ((profitAmount / totalBuy) * 100).toFixed(2)
            : '0.00';
        const isPositive = profitAmount >= 0;

        return { totalBuy, totalEval, profitAmount, profitRate, isPositive };
    }, [orders, tickerMap]);

    // 🖥️ 화면 출력
    return (
        <div className="asset-summary">

            {/* 💰 현금 & 총 자산 */}
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">보유 KRW</span>
                    <span className="bigvalue">{formatNumber(cash)} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 보유자산</span>
                    <span className="bigvalue">{formatNumber(cash + totalEval)} <small>KRW</small></span>
                </div>
            </div>

            <div className="summary-divider"></div>

            {/* 📉 매수 금액 & 손익 */}
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 매수</span>
                    <span className="value">{formatNumber(totalBuy)} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가손익</span>
                    <span className={`value ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : ''}
                        {formatNumber(profitAmount, 2)} <small>KRW</small>
                    </span>
                </div>
            </div>

            {/* 📈 평가 금액 & 수익률 */}
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 평가</span>
                    <span className="value">{formatNumber(totalEval)} <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가수익률</span>
                    <span className={`value ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '+' : ''}
                        {profitRate}%
                    </span>
                </div>
            </div>

            {/* 🟢 주문 가능 금액 */}
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">주문가능</span>
                    <span className="value">{formatNumber(cash)} <small>KRW</small></span>
                </div>
            </div>
        </div>
    );
}
