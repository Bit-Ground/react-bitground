import { useState, useEffect, useContext } from "react";
import Sidebar from "../components/trade/Sidebar.jsx";
import PortfolioHeader from "../components/Investments/PortfolioHeader.jsx";
import AssetSummary from "../components/Investments/AssetSummary.jsx";
import HoldingsList from "../components/Investments/HoldingsList.jsx";
import TradeHistory from "../components/Investments/TradeHistory.jsx";
import PendingOrders from "../components/Investments/PendingOrders.jsx";
import { AuthContext } from "../auth/AuthContext";
import { TickerContext } from "../ticker/TickerProvider.jsx";
import api from "../api/axiosConfig.js";
import './Investments.css';
import "../styles/trade/Trade.css";

export default function Investments() {
    const [activeTab, setActiveTab] = useState('보유자산');
    const [favoriteMarkets, setFavoriteMarkets] = useState([]);
    const [ownedMarkets, setOwnedMarkets] = useState([]);

    const { user } = useContext(AuthContext);
    const {
        markets,
        tickerMap,
        selectedMarket,
        setSelectedMarket,
    } = useContext(TickerContext);

    useEffect(() => {
        if (!user?.id) return;
        api.get('/api/favorites', { params: { userId: user.id } })
            .then(res => setFavoriteMarkets(res.data));
        api.get(`/api/assets?userId=${user.id}`)
            .then(res => setOwnedMarkets(res.data));
    }, [user]);

    const toggleFavorite = (symbol) => {
        const isFav = favoriteMarkets.includes(symbol);
        const req = isFav
            ? api.delete(`/api/favorites/${symbol}`, { params: { userId: user.id } })
            : api.post('/api/favorites', null, { params: { userId: user.id, symbol } });
        req.then(() => {
            setFavoriteMarkets(prev =>
                isFav ? prev.filter(s => s !== symbol) : [...prev, symbol]
            );
        });
    };

    return (
        <div className="crypto-portfolio">
            <div className="main-content">
                <PortfolioHeader activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="tab-content">
                    {activeTab === '보유자산' && (
                        <>
                            <AssetSummary />
                            <HoldingsList />
                        </>
                    )}
                    {activeTab === '거래내역' && <TradeHistory />}
                    {activeTab === '미체결' && <PendingOrders />}
                </div>
            </div>

            <aside className="sidebar">
                <Sidebar
                    markets={markets}
                    tickerMap={tickerMap}
                    ownedMarkets={ownedMarkets}
                    favoriteMarkets={favoriteMarkets}
                    selectedMarket={selectedMarket}
                    onSelectMarket={setSelectedMarket}
                    onToggleFav={toggleFavorite}
                />
            </aside>
        </div>
    );
}
