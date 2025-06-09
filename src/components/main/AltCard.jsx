import "../../styles/main/AltCard.css";

export default function altCard({ title, subtitle, value, avgValue, children }) {
    const isUp = value >= avgValue;
    const diffValue = Math.abs(value - avgValue);
    const diffRate = ((diffValue / avgValue) * 100).toFixed(2);

    const mainColor = isUp ? '#E93E2A' : '#2979ff';

    return (
        <div className="alt-card">
            <div className="alt-card-content">
                <div className="alt-card-info">
                    <div className="alt-card-title">{title}</div>
                    <div className="alt-card-subtitle">{subtitle}</div>
                    <div className="alt-card-value" style={{ color: mainColor }}>
                        {value.toLocaleString()}
                    </div>
                    <div className="alt-card-diff" style={{ color: mainColor }}>
                        {isUp ? '▲' : '▼'} {diffValue.toLocaleString()} ({diffRate}%)
                    </div>
                </div>
                <div className="alt-card-chart">
                    {children}
                </div>
            </div>
        </div>
    );
}