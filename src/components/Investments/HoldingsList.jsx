import { useContext, useMemo } from 'react';
import { TickerContext } from '../../ticker/TickerProvider';

// 🔢 숫자 포맷 함수: 자릿수 지정 가능하고, trimZeros=true일 경우 0 생략
function formatNumber(value, digits = 2, trimZeros = false) {
    if (isNaN(value)) return '-';
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: trimZeros ? 0 : digits,
        maximumFractionDigits: digits,
    });
}

// 🎯 코인별 소수점 자릿수 설정 (업비트 기준)
function getDecimalPlaces(symbol) {
    if (!symbol) return 0;
    if (symbol === 'BTC' || symbol === 'ETH') return 6;
    if (symbol === 'DOGE' || symbol === 'XRP') return 2;
    return 4; // 기본값
}

// 📦 보유 자산 목록 컴포넌트
export default function HoldingsList({ orders = [], seasonId }) {
    const { tickerMap } = useContext(TickerContext); // 실시간 시세 정보 (WebSocket 등으로 제공됨)

    // 📊 보유 내역 계산 로직 (order 데이터를 기반으로 집계)
    const processedHoldings = useMemo(() => {
        const grouped = {};

        // 1. 코인별로 매수/매도 데이터를 그룹핑
        orders.forEach(order => {
            const { symbol, orderType, amount, tradePrice, coinName } = order;
            const quantity = Number(amount ?? 0);
            const price = Number(tradePrice ?? 0);

            // 해당 symbol이 처음 등장했다면 초기화
            if (!grouped[symbol]) {
                grouped[symbol] = {
                    symbol,
                    coinName,
                    totalBuyAmount: 0,   // 총 매수 수량
                    totalBuyCost: 0,     // 총 매수 금액
                    totalSellAmount: 0,  // 총 매도 수량
                };
            }

            // 매수/매도에 따라 누적
            if (orderType === 'BUY') {
                grouped[symbol].totalBuyAmount += quantity;
                grouped[symbol].totalBuyCost += quantity * price;
            } else if (orderType === 'SELL') {
                grouped[symbol].totalSellAmount += quantity;
            }
        });

        // 2. 그룹별로 보유 수량과 평가 정보 계산
        return Object.values(grouped)
            .map(item => {
                const { symbol, coinName, totalBuyAmount, totalBuyCost, totalSellAmount } = item;
                const holdingAmount = totalBuyAmount - totalSellAmount; // 현재 보유 수량

                // 0 이하 보유는 표시하지 않음
                if (holdingAmount <= 0) return null;

                const avgPrice = totalBuyAmount !== 0 ? totalBuyCost / totalBuyAmount : 0; // 평균 매수가
                const currentPrice = tickerMap[symbol]?.price ?? 0;                        // 현재 시세
                const evaluation = holdingAmount * currentPrice;                          // 평가 금액
                const buyAmount = holdingAmount * avgPrice;                               // 매수 금액
                const profitAmount = evaluation - buyAmount;                              // 평가손익
                const profitRate = buyAmount !== 0
                    ? ((profitAmount / buyAmount) * 100).toFixed(2)
                    : '0.00';                                                             // 수익률 %
                const isPositive = profitAmount >= 0;                                     // 수익 여부

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
                {/* 📌 테이블 헤더 */}
                <div className="table-header">
                    <div className="col">보유자산</div>
                    <div className="col">보유수량</div>
                    <div className="col">매수평균가</div>
                    <div className="col">매수금액</div>
                    <div className="col">평가금액</div>
                    <div className="col profit-info">평가손익</div>
                </div>

                {/* 📄 계산된 보유 내역 표시 */}
                {processedHoldings.map((item, index) => {
                    const symbol = item.symbol?.replace('KRW-', '') ?? '';        // KRW- 접두사 제거
                    const decimal = getDecimalPlaces(symbol);                     // 소수점 자리 설정

                    return (
                        <div key={index} className="table-row">
                            {/* 코인명/심볼 */}
                            <div className="col coin-info">
                                <div>
                                    <div className="coin-name">{item.coinName ?? '-'}</div>
                                    <div className="coin-symbol">{symbol}</div>
                                </div>
                            </div>

                            {/* 보유 수량 */}
                            <div className="col">
                                {formatNumber(item.quantity, decimal, true)} <small>{symbol}</small>
                            </div>

                            {/* 매수 평균가 */}
                            <div className="col">
                                {formatNumber(item.avgPrice, 4, true)} <small>KRW</small>
                            </div>

                            {/* 매수 금액 */}
                            <div className="col">
                                {formatNumber(item.buyAmount, 0)} <small>KRW</small>
                            </div>

                            {/* 평가 금액 */}
                            <div className="col">
                                {formatNumber(item.evaluation, 0)} <small>KRW</small>
                            </div>

                            {/* 평가 손익 및 수익률 */}
                            <div className="col profit-info">
                                <div className={`profit-rate ${item.isPositive ? 'positive' : 'negative'}`}>
                                    {item.profitRate} %
                                </div>
                                <div className={`profit-amount ${item.isPositive ? 'positive' : 'negative'}`}>
                                    {formatNumber(item.profitAmount, 0)} <small>KRW</small>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
