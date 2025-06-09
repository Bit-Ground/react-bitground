import "../../styles/main/MarketCard.css";

export default function MarketCard({ title, subtitle, value, diffValue, diffRate, children }) {
    return (
        <div className="market-card">
            <div className="market-card-content">
                <div className="market-card-info">
                    <div className="market-card-title">{title}</div>
                    <div className="market-card-subtitle">{subtitle}</div>
                    <div className="market-card-value">{value.toLocaleString()}</div>
                    <div className="market-card-diff">
                        ▼ {diffValue} ({diffRate}%)
                    </div>
                </div>
                <div className="market-card-chart">
                    {children}
                </div>
            </div>
        </div>
    );
}