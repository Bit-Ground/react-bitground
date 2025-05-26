import Sidebar from "../components/Investments/Sidebar.jsx";
import PortfolioHeader from "../components/Investments/PortfolioHeader.jsx";
import AssetSummary from "../components/Investments/AssetSummary.jsx";
import HoldingsList from "../components/Investments/HoldingsList.jsx";
import './Investments.css';

export default function Investments() {
    return (
        <div className="crypto-portfolio">
            <div className="main-content">
                <PortfolioHeader />
                <AssetSummary />
                <HoldingsList />
            </div>

            <div className="sidebar-container">
                <Sidebar />
            </div>
        </div>
    );
}