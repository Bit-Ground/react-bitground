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
        <div className="holdings-list">
            {/*<div className="holdings-header">*/}
            {/*    <h3>거래 내역</h3>*/}
            {/*</div>*/}
            <div className="holdings-table">
                <div className="table-header">
                    <div className="col">보유자산</div>
                    <div className="col">보유수량</div>
                    <div className="col">매수평균가</div>
                    <div className="col">매수금액</div>
                    <div className="col">평가금액</div>
                    <div className="col">평가손익</div>
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
