import "../../styles/main/AltCard.css";

export default function AltCard({ title, subtitle, value, diffValue, diffRate, children }) {
    return (
        <div className="alt-card">
            <div className="alt-card-content">
                <div className="alt-card-info">
                    <div className="alt-card-title">{title}</div>
                    <div className="alt-card-subtitle">{subtitle}</div>
                    <div className="alt-card-value">{value.toLocaleString()}</div>
                    <div className="alt-card-diff">
                        ▼ {diffValue} ({diffRate}%)
                    </div>
                </div>
                <div className="alt-card-chart">
                    {children}
                </div>
            </div>
        </div>
    );
}