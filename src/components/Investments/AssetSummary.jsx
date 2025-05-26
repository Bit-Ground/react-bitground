export default function AssetSummary() {
    return (
        <div className="asset-summary">
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">보유 KRW</span>
                    <span className="value">1,200,000 <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 보유자산</span>
                    <span className="value">11,400,000 <small>KRW</small></span>
                </div>
            </div>
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 매수</span>
                    <span className="value">8,800,000 <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가손익</span>
                    <span className="value positive">+932,000 <small>KRW</small></span>
                </div>
            </div>
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">총 평가</span>
                    <span className="value">10,200,000 <small>KRW</small></span>
                </div>
                <div className="summary-item">
                    <span className="label">총 평가수익률</span>
                    <span className="value positive">+9.44</span>
                </div>
            </div>
            <div className="summary-row">
                <div className="summary-item">
                    <span className="label">수량기준</span>
                    <span className="value">1,200,000 <small>KRW</small></span>
                </div>
            </div>
        </div>
    );
};
