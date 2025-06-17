import { useContext, useMemo, useEffect } from "react";
import { TickerContext } from "../../ticker/TickerProvider";

// 📌 숫자 포맷 함수 (소수점 자리수 지정 가능)
function formatNumber(value, digits = 0) {
    if (isNaN(value)) return '-';
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

export default function AssetSummary({ userAssets, cash }) {
    const { tickerMap } = useContext(TickerContext);
    useEffect(() => {
        console.log("💰 [cash props]:", cash, typeof cash);
    }, [cash]);

    // 📊 평가금액, 매수금액, 손익률 계산
    const {
        totalBuy,
        totalEval,
        profitAmount,
        profitRate,
        isPositive
    } = useMemo(() => {
        let totalBuy = 0;
        let totalEval = 0;

        userAssets.forEach(asset => {
            const rawSymbol = asset.symbol;

            // ✅ tickerMap의 키 형식이 "KRW-BTC"라면 아래 보정 사용
            const symbol = rawSymbol.includes("KRW-") ? rawSymbol : `KRW-${rawSymbol}`;

            // ✅ 만약 tickerMap 키가 "BTC"처럼 짧다면 이걸로 교체
            // const symbol = rawSymbol.replace("KRW-", "");

            const currentPrice = tickerMap?.[symbol]?.price ?? 0;
            const amount = Number(asset.amount) || 0;
            const avgPrice = Number(asset.avgPrice) || 0;

            totalBuy += amount * avgPrice;
            totalEval += amount * currentPrice;
        });

        const profitAmount = totalEval - totalBuy;
        const profitRate = totalBuy !== 0
            ? ((profitAmount / totalBuy) * 100).toFixed(2)
            : '0.00';
        const isPositive = profitAmount >= 0;


        return { totalBuy, totalEval, profitAmount, profitRate, isPositive };
    }, [userAssets, tickerMap]);

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
                        {formatNumber(profitAmount)} <small>KRW</small>
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
