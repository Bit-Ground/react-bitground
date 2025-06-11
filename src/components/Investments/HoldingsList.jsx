import { useContext, useMemo } from 'react';
import { TickerContext } from '../../ticker/TickerProvider';

// 🔢 숫자 포맷 함수: 자릿수 지정해서 보기 좋게 표시
function formatNumber(value, digits = 0) {
    if (isNaN(value)) return '-';
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

// 🎯 업비트 기준 코인별 소수점 자리 설정
function getDecimalPlaces(symbol) {
    if (!symbol) return 0;
    if (symbol === 'BTC' || symbol === 'ETH') return 6;
    if (symbol === 'DOGE' || symbol === 'XRP') return 2;
    return 4; // 기본 4자리
}

export default function HoldingsList({ orders = [], seasonId }) {
    const { tickerMap } = useContext(TickerContext); // 📡 실시간 시세 정보

    // 🧮 주문 내역과 시세를 기반으로 보유 자산 계산
    const processedHoldings = useMemo(() => {
        const grouped = {}; // 같은 종목(symbol)끼리 합치기 위한 객체

        // 🔁 모든 주문 처리
        orders.forEach(order => {
            const { symbol, orderType, amount, tradePrice, coinName } = order;
            const quantity = Number(amount ?? 0);
            const price = Number(tradePrice ?? 0);

            if (!grouped[symbol]) {
                grouped[symbol] = {
                    symbol,
                    coinName,
                    totalBuyAmount: 0,
                    totalBuyCost: 0,
                    totalSellAmount: 0,
                };
            }

            if (orderType === 'BUY') {
                grouped[symbol].totalBuyAmount += quantity;
                grouped[symbol].totalBuyCost += quantity * price;
            } else if (orderType === 'SELL') {
                grouped[symbol].totalSellAmount += quantity;
            }
        });

        return Object.values(grouped)
            .map(item => {
                const { symbol, coinName, totalBuyAmount, totalBuyCost, totalSellAmount } = item;

                const holdingAmount = totalBuyAmount - totalSellAmount;
                if (holdingAmount <= 0) return null; // 🔻 보유량이 0 이하면 제외

                const avgPrice = totalBuyAmount !== 0 ? totalBuyCost / totalBuyAmount : 0;
                const currentPrice = tickerMap[symbol]?.price ?? 0;
                const evaluation = holdingAmount * currentPrice;
                const buyAmount = holdingAmount * avgPrice;
                const profitAmount = evaluation - buyAmount;
                const profitRate = buyAmount !== 0
                    ? ((profitAmount / buyAmount) * 100).toFixed(2)
                    : '0.00';
                const isPositive = profitAmount >= 0;

                return {
                    coinName,
                    symbol,
                    quantity: holdingAmount,
                    avgPrice,
                    currentPrice,
                    buyAmount,
                    evaluation,
                    profitAmount,
                    profitRate,
                    isPositive
                };
            })
            .filter(Boolean); // null 제거
    }, [orders, tickerMap, seasonId]);

    return (
        <div className="holdings-list">
            <div className="holdings-header">
                <h3>보유자산 목록</h3>
            </div>

            <div className="holdings-table">
                {/* 📋 테이블 헤더 */}
                <div className="table-header">
                    <div className="col">보유자산</div>
                    <div className="col">보유수량</div>
                    <div className="col">매수평균가</div>
                    <div className="col">매수금액</div>
                    <div className="col">평가금액</div>
                    <div className="col profit-info">평가손익</div>
                </div>

                {/* 📦 실제 데이터 렌더링 */}
                {processedHoldings.map((item, index) => {
                    const symbol = item.symbol?.replace('KRW-', '') ?? '';       // "KRW-BTC" -> "BTC"
                    const decimal = getDecimalPlaces(symbol);                    // 코인 소수 자릿수 결정

                    return (
                        <div key={index} className="table-row">
                            {/* 🔹 코인명 및 심볼 */}
                            <div className="col coin-info">
                                <div>
                                    <div className="coin-name">{item.coinName ?? '-'}</div>
                                    <div className="coin-symbol">{symbol}</div>
                                </div>
                            </div>

                            {/* 🔢 보유 수량 */}
                            <div className="col">
                                {formatNumber(item.quantity, decimal)} <small>{symbol}</small>
                            </div>

                            {/* 💵 매수 평균가 */}
                            <div className="col">
                                {formatNumber(item.avgPrice)} <small>KRW</small>
                            </div>

                            {/* 💸 총 매수금액 */}
                            <div className="col">
                                {formatNumber(item.buyAmount)} <small>KRW</small>
                            </div>

                            {/* 💰 평가금액 */}
                            <div className="col">
                                {formatNumber(item.evaluation)} <small>KRW</small>
                            </div>

                            {/* 📈 손익 및 수익률 */}
                            <div className="col profit-info">
                                <div className={`profit-rate ${item.isPositive ? 'positive' : 'negative'}`}>
                                    {item.profitRate} %
                                </div>
                                <div className={`profit-amount ${item.isPositive ? 'positive' : 'negative'}`}>
                                    {formatNumber(item.profitAmount)} <small>KRW</small>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
