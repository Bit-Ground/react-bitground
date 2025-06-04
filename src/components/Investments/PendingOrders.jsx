export default function PendingOrders() {
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
        <div className="holdings-list">
            <div className="holdings-header">
                <div className="orders-header">
                    <select className="order-select">
                        <option value="all">전체주문</option>
                        <option value="buy">매수주문</option>
                        <option value="sell">매도주문</option>
                    </select>
                    <button className="cancel-all-btn">전체취소</button>
                </div>
            </div>
            <div className="holdings-table">
                <div className="table-header">
                    <div className="col">코인명</div>
                    <div className="col">주문수량</div>
                    <div className="col">감시가격</div>
                    <div className="col">주문가격</div>
                    <div className="col">주문시간</div>
                    <div className="col">미체결량</div>
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
    );
};
