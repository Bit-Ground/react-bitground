export default function AssetSummary() {

    const profitRate = +13.27; // 예: 실제 수익률 값
    const profitAmount = 932000; // 예: +932000, -250000 등 숫자

    return (
        <div className="asset-summary">
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">보유 KRW</span>
                    <span className="bigvalue">1,200,000 <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 보유자산</span>
                    <span className="bigvalue">11,400,000 <small>KRW</small></span>
                </div>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 매수</span>
                    <span className="value">8,800,000 <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가손익</span>
                    <span
                        className={`value ${
                            profitAmount > 0 ? 'positive' :
                                profitAmount < 0 ? 'negative' : ''
                        }`}
                    >
                        {profitAmount > 0 ? '+' : ''}
                        {profitAmount.toLocaleString()} <small>KRW</small>
                    </span>
                </div>
            </div>

            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 평가</span>
                    <span className="value">10,200,000 <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가수익률</span>

                    <span
                        className={`value ${
                            profitRate > 0 ? 'positive' :
                                profitRate < 0 ? 'negative' : ''
                        }`}
                    >
                        {profitRate > 0 ? '+' : ''}
                        {profitRate.toFixed(2)}%
                    </span>
                </div>
            </div>

            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">주문가능</span>
                    <span className="value">1,200,000 <small>KRW</small></span>
                </div>
            </div>
        </div>

    );
};
