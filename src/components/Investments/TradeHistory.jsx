export default function TradeHistory() {
    const holdings = [
        {
            coin: '비트코인',
            symbol: 'BTC',
            quantity: '0.028',
            avgPrice: '146,517,000',
            currentPrice: '4,146,431',
            evaluation: '5,146,431',
            profit: '+12.01',
            profitAmount: '+121,798'
        },
        {
            coin: '비트코인',
            symbol: 'BTC',
            quantity: '0.028',
            avgPrice: '146,517,000',
            currentPrice: '4,146,431',
            evaluation: '5,146,431',
            profit: '+12.01',
            profitAmount: '+121,798'
        },
        {
            coin: '비트코인',
            symbol: 'BTC',
            quantity: '0.028',
            avgPrice: '146,517,000',
            currentPrice: '4,146,431',
            evaluation: '5,146,431',
            profit: '+12.01',
            profitAmount: '+121,798'
        }
    ];

    return (
<div>
    <div className="filter-container">
        <div className="season-select-container">
            <span className="season-label">시즌 선택</span>
            <select className="season-select">
                <option>2025-01 (04.01 ~ 04.15)</option>
                <option>2025-02 (04.16 ~ 04.30)</option>
                <option>2025-03 (05.01 ~ 05.15)</option>
                <option>2025-04 (05.16 ~ 05.31)</option>
            </select>
        </div>

        <div className="filter-section type-select">
            <span className="season-label">종류</span>
            <button className="filter-button active">전체</button>
            <button className="filter-button">매수</button>
            <button className="filter-button">매도</button>
        </div>

        <div className="filter-section coin-select">
            <span className="season-label">코인선택</span>
            <button className="filter-button">🔍</button>
        </div>
    </div>

        <div className="holdings-list">
            <div className="holdings-table">
                <div className="table-header">
                    <div className="col">코인명</div>
                    <div className="col">거래수량</div>
                    <div className="col">거래단가</div>
                    <div className="col">거래금액</div>
                    <div className="col">체결시간</div>
                    <div className="col">주문시간</div>
                </div>
                {holdings.map((item, index) => (
                    <div key={index} className="table-row">
                        <div className="col coin-info">
                            <div className="coin-icon">₿</div>
                            <div>
                                <div className="coin-name">{item.coin}</div>
                                <div className="coin-symbol">{item.symbol}</div>
                            </div>
                        </div>
                        <div className="col">{item.quantity} <small>BTC</small></div>
                        <div className="col">{item.avgPrice} <small>KRW</small></div>
                        <div className="col">{item.currentPrice} <small>KRW</small></div>
                        <div className="col">{item.evaluation} <small>KRW</small></div>
                        <div className="col profit-info">
                            <div className="profit-rate positive">{item.profit} %</div>
                            <div className="profit-amount positive">{item.profitAmount} <small>KRW</small></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
</div>
    );
};
