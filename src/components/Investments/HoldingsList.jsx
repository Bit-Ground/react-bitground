import { useContext, useMemo, useState } from 'react';
import { TickerContext } from '../../ticker/TickerProvider';

// 🔢 숫자 포맷 함수
function formatNumber(value, digits = 2, trimZeros = false) {
    if (isNaN(value)) return '-';
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: trimZeros ? 0 : digits,
        maximumFractionDigits: digits,
    });
}

// 🎯 코인별 소수점 자릿수 설정
function getDecimalPlaces(symbol) {
    if (!symbol) return 0;
    if (symbol === 'BTC' || symbol === 'ETH') return 6;
    if (symbol === 'DOGE' || symbol === 'XRP') return 2;
    return 4;
}

export default function HoldingsList({ orders = [], seasonId }) {
    const { tickerMap } = useContext(TickerContext);

    const [sortKey, setSortKey] = useState('evaluation'); // 기본 정렬: 평가금액
    const [sortOrder, setSortOrder] = useState('desc');   // 기본 내림차순

    const onSort = key => {
        if (sortKey === key) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const processedHoldings = useMemo(() => {
        const grouped = {};

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

        let result = Object.values(grouped)
            .map(item => {
                const { symbol, coinName, totalBuyAmount, totalBuyCost, totalSellAmount } = item;
                const holdingAmount = totalBuyAmount - totalSellAmount;
                if (holdingAmount <= 0) return null;

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
            .filter(Boolean);

        // 🔽 정렬 적용
        result.sort((a, b) => {
            let va = a[sortKey];
            let vb = b[sortKey];
            if (sortKey === 'coinName') {
                return va.localeCompare(vb) * (sortOrder === 'asc' ? 1 : -1);
            }
            return (vb - va) * (sortOrder === 'asc' ? -1 : 1);
        });

        return result;
    }, [orders, tickerMap, seasonId, sortKey, sortOrder]);

    return (
        <div className="holdings-list">
            <div className="holdings-header">
                <h3>보유자산 목록</h3>
            </div>

            <div className="holdings-table">
                {/* 📌 테이블 헤더 */}
                <div className="table-header">
                    <div className="col" onClick={() => onSort('coinName')}>
                        보유자산 {sortKey === 'coinName' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col">보유수량</div>
                    <div className="col">매수평균가</div>
                    <div className="col" onClick={() => onSort('buyAmount')}>
                        매수금액 {sortKey === 'buyAmount' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col" onClick={() => onSort('evaluation')}>
                        평가금액 {sortKey === 'evaluation' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col profit-info" onClick={() => onSort('profitAmount')}>
                        평가손익 {sortKey === 'profitAmount' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                </div>

                {/* 📄 계산된 보유 내역 표시 */}
                {processedHoldings.map((item, index) => {
                    const symbol = item.symbol?.replace('KRW-', '') ?? '';
                    const decimal = getDecimalPlaces(symbol);

                    return (
                        <div key={index} className="table-row">
                            <div className="col coin-info">
                                <div>
                                    <div className="coin-name">{item.coinName ?? '-'}</div>
                                    <div className="coin-symbol">{symbol}</div>
                                </div>
                            </div>

                            <div className="col">
                                {formatNumber(item.quantity, decimal, true)} <small>{symbol}</small>
                            </div>

                            <div className="col">
                                {formatNumber(item.avgPrice, 4, true)} <small>KRW</small>
                            </div>

                            <div className="col">
                                {formatNumber(item.buyAmount, 0)} <small>KRW</small>
                            </div>

                            <div className="col">
                                {formatNumber(item.evaluation, 0)} <small>KRW</small>
                            </div>

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
