import { useContext, useMemo } from 'react';
import { TickerContext } from '../../ticker/TickerProvider';

export default function HoldingsList({ orders = [] }) {
    const { tickerMap } = useContext(TickerContext); // 📡 실시간 시세 (WebSocket 기반)

    // 주문 내역과 실시간 시세를 조합해서 보유 자산 정보 계산
    const processedHoldings = useMemo(() => {
        return orders
            .filter(order => order.orderType === 'BUY') // 🟢 매수만 필터링
            .map(order => {
            const quantity = Number(order.amount ?? 0);           // 보유 수량
            const avgPrice = Number(order.tradePrice ?? 0);       // 매수 평균가
            const symbol = order.symbol ?? '';                    // 예: BTC
            const marketCode = `KRW-${symbol}`;                   // 예: KRW-BTC
            const currentPrice = tickerMap[marketCode]?.price ?? 0; // 현재 시세

            const evaluation = quantity * currentPrice;           // 평가금액 = 수량 * 현재가
            const buyAmount = quantity * avgPrice;                // 매수금액 = 수량 * 평균매수가
            const profitAmount = evaluation - buyAmount;          // 손익 = 평가금액 - 매수금액
            const profitRate = buyAmount !== 0
                ? ((profitAmount / buyAmount) * 100).toFixed(2)   // 수익률 계산
                : '0.00';

            const isPositive = profitAmount >= 0;                 // 수익 여부 판단

            // 원래 order 정보에 계산된 값 추가해서 리턴
            return {
                ...order,
                quantity,
                avgPrice,
                currentPrice,
                evaluation,
                buyAmount,
                profitAmount,
                profitRate,
                isPositive
            };
        });
    }, [orders, tickerMap]); // orders 또는 tickerMap이 변경될 때만 재계산

    // 화면에 자산 리스트 렌더링
    return (
        <div className="holdings-list">
            <div className="holdings-header">
                <h3>보유자산 목록</h3>
            </div>

            <div className="holdings-table">
                {/* 테이블 헤더 */}
                <div className="table-header">
                    <div className="col">보유자산</div>
                    <div className="col">보유수량</div>
                    <div className="col">매수평균가</div>
                    <div className="col">매수금액</div>
                    <div className="col">평가금액</div>
                    <div className="col">평가손익</div>
                </div>

                {/* 보유 자산 데이터 렌더링 */}
                {processedHoldings.map((item, index) => (
                    <div key={index} className="table-row">
                        {/* 코인명 / 심볼 */}
                        <div className="col coin-info">
                            <div>
                                <div className="coin-name">{item.coinName ?? '-'}</div>
                                <div className="coin-symbol">{item.symbol ?? '-'}</div>
                            </div>
                        </div>

                        {/* 수량 */}
                        <div className="col">
                            {item.quantity} <small>{item.symbol}</small>
                        </div>

                        {/* 매수평균가 */}
                        <div className="col">
                            {item.avgPrice.toLocaleString()} <small>KRW</small>
                        </div>

                        {/* 총 매수금액 */}
                        <div className="col">
                            {item.buyAmount.toLocaleString()} <small>KRW</small>
                        </div>

                        {/* 평가금액 */}
                        <div className="col">
                            {item.evaluation.toLocaleString()} <small>KRW</small>
                        </div>

                        {/* 수익률 및 손익 */}
                        <div className="col profit-info">
                            <div className={`profit-rate ${item.isPositive ? 'positive' : 'negative'}`}>
                                {item.profitRate} %
                            </div>
                            <div className={`profit-amount ${item.isPositive ? 'positive' : 'negative'}`}>
                                {item.profitAmount.toLocaleString()} <small>KRW</small>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
