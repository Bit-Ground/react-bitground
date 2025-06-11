import "../../styles/main/MarketCard.css";

export default function MarketCard({ title, subtitle, value, avgValue, children }) {
    const isUp = value >= avgValue;
    const diffValue = Math.abs(value - avgValue);
    const diffRate = ((diffValue / avgValue) * 100).toFixed(2);

    const mainColor = isUp ? '#E93E2A' : '#2979ff';

    return (
        <div className="market-card">
            <div className="market-card-content">
                <div className="market-card-info">
                    <div className="market-card-title">{title}</div>
                    <div className="market-card-subtitle">{subtitle}</div>
                    <div className="market-card-value" style={{ color: mainColor }}>
                        {value.toLocaleString()}
                    </div>
                    <div className="market-card-diff" style={{ color: mainColor }}>
                        {isUp ? '▲' : '▼'} {diffValue.toLocaleString()} ({diffRate}%)
                    </div>
                </div>
                <div className="market-card-chart">
                    {children}
                </div>
            </div>
        </div>
    );
}