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

    // 📊 주문 + 시세 기반 자산 계산 (업비트처럼 매도 반영)
    const {
        totalBuy,
        totalEval,
        profitAmount,
        profitRate,
        isPositive
    } = useMemo(() => {
        let totalBuy = 0;
        let totalEval = 0;

        // 🧮 1. 종목별로 주문 묶기
        const orderMap = new Map();

        orders.forEach(order => {
            const symbol = order.symbol;
            if (!orderMap.has(symbol)) {
                orderMap.set(symbol, []);
            }
            orderMap.get(symbol).push(order);
        });

        // 🔁 2. 각 종목별 정산
        orderMap.forEach(orderList => {
            const symbol = orderList[0]?.symbol;
            const currentPrice = tickerMap?.[symbol]?.price ?? 0;

            const buys = orderList.filter(o => o.orderType === 'BUY');
            const sells = orderList.filter(o => o.orderType === 'SELL');

            const totalBuyQty = buys.reduce((sum, o) => sum + Number(o.amount), 0);
            const totalSellQty = sells.reduce((sum, o) => sum + Number(o.amount), 0);
            let remainingQty = totalBuyQty - totalSellQty;

            if (remainingQty <= 0) return; // ⚠️ 전량 매도된 경우 제외

            // 🧮 남은 수량 기준 평가금액, 매수금액 계산
            for (const buy of buys) {
                if (remainingQty <= 0) break;

                const buyQty = Number(buy.amount);
                const buyPrice = Number(buy.tradePrice);

                const usedQty = Math.min(remainingQty, buyQty);
                totalBuy += usedQty * buyPrice;
                totalEval += usedQty * currentPrice;

                remainingQty -= usedQty;
            }
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
                        {formatNumber(profitAmount, 0)} <small>KRW</small>
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
