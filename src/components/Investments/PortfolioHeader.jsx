import {useState} from "react";

export default function PortfolioHeader() {
    const [activeTab, setActiveTab] = useState('보유자산');
    const tabs = ['보유자산', '거래내역', '미체결'];

    return (
        <div className="portfolio-header">
            <div className="tab-container">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        className={`tab ${activeTab === tab ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};



