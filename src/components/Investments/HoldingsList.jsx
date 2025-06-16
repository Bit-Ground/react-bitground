import { useContext, useMemo, useState } from 'react';
import { TickerContext } from '../../ticker/TickerProvider';

// 🔢 숫자 포맷 함수 (자동 소수점 감지 버전)
function formatNumber(value, digits = undefined, trimZeros = true) {
    if (isNaN(value)) return '-';

    const num = Number(value);
    const fractionDigits = digits ?? (num < 1 ? 8 : 2);

    return num.toLocaleString(undefined, {
        minimumFractionDigits: trimZeros ? 0 : fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

export default function HoldingsList({ userAssets }) {
    const { tickerMap, markets } = useContext(TickerContext);

    const [sortKey, setSortKey] = useState('evaluation');
    const [sortOrder, setSortOrder] = useState('desc');

    const onSort = key => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('desc');
        }
    };

    const processedHoldings = useMemo(() => {
        const result = userAssets.map(asset => {
            const symbol = asset.symbol;
            const symbolShort = symbol.replace('KRW-', '');
            const coinName = markets.find(m => m.market === symbol)?.name ?? symbolShort;
            const quantity = Number(asset.amount);
            const avgPrice = Number(asset.avgPrice);
            const currentPrice = tickerMap[symbol]?.price ?? 0;

            const evaluation = quantity * currentPrice;
            const buyAmount = quantity * avgPrice;
            const profitAmount = evaluation - buyAmount;
            const profitRate = buyAmount !== 0
                ? ((profitAmount / buyAmount) * 100).toFixed(2)
                : '0.00';
            const isPositive = profitAmount >= 0;

            return {
                coinName,
                symbol,
                symbolShort,
                quantity,
                avgPrice,
                currentPrice,
                buyAmount,
                evaluation,
                profitAmount,
                profitRate,
                isPositive,
            };
        });

        result.sort((a, b) => {
            let va = a[sortKey];
            let vb = b[sortKey];
            if (sortKey === 'coinName') {
                return va.localeCompare(vb) * (sortOrder === 'asc' ? 1 : -1);
            }
            return (vb - va) * (sortOrder === 'asc' ? -1 : 1);
        });

        return result;
    }, [userAssets, tickerMap, sortKey, sortOrder]);

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
                    <div className="col">매수평균가 <small>KRW</small></div>
                    <div className="col" onClick={() => onSort('buyAmount')}>
                        매수금액 <small>KRW</small>{sortKey === 'buyAmount' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col" onClick={() => onSort('evaluation')}>
                        평가금액 <small>KRW</small>{sortKey === 'evaluation' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                    <div className="col profit-info" onClick={() => onSort('profitAmount')}>
                        평가손익 {sortKey === 'profitAmount' && (sortOrder === 'asc' ? '▲' : '▼')}
                    </div>
                </div>

                {/* 📄 보유 내역 표시 */}
                {processedHoldings.map((item, index) => (
                    <div key={index} className="table-row">
                        <div className="col coin-info">
                            <div>
                                <div className="coin-name">{item.coinName}</div>
                                <div className="coin-symbol">{item.symbolShort}</div>
                            </div>
                        </div>

                        <div className="col">
                            {formatNumber(item.quantity, 10)}
                        </div>

                        <div className="col">
                            {formatNumber(item.avgPrice,8)}
                        </div>

                        <div className="col">
                            {formatNumber(item.buyAmount)}
                        </div>

                        <div className="col">
                            {formatNumber(item.evaluation,0)}
                        </div>

                        <div className="col profit-info">
                            <div className={`profit-rate ${item.isPositive ? 'positive' : 'negative'}`}>
                                {item.profitRate} %
                            </div>
                            <div className={`profit-amount ${item.isPositive ? 'positive' : 'negative'}`}>
                                {formatNumber(item.profitAmount,0)} <small>KRW</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
