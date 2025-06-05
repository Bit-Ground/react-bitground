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
    const [seasonId, setSeasonId] = useState(1); // ✅ 현재 시즌 ID 상태
    const [orders, setOrders] = useState([]);   // ✅ 주문 데이터 상태

    const { user } = useContext(AuthContext);
    const {
        markets,
        tickerMap,
        selectedMarket,
        setSelectedMarket,
    } = useContext(TickerContext);

    // ✅ 시즌 ID와 사용자 ID로 주문 내역 불러오기
    useEffect(() => {
        if (!seasonId || !user?.id) return;

        api.get('/api/favorites', { params: { userId: user.id } })
            .then(res => setFavoriteMarkets(res.data))
            .catch(() => setFavoriteMarkets([]));

        api.get(`/orders/${seasonId}`, { withCredentials: true })
            .then(res => {
                const enrichedOrders = res.data.map(order => {
                    const symbol = order.symbol;
                    const marketCode = `KRW-${symbol}`;
                    const currentPrice = tickerMap[marketCode]?.price || 0;
                    return {
                        ...order,
                        currentPrice
                    };
                });

                const marketsFromOrders = enrichedOrders.map(o => o.symbol);
                setOwnedMarkets(marketsFromOrders);
                setOrders(enrichedOrders);
            })
            .catch(err => {
                console.error('보유 종목 불러오기 실패:', err);
            });
    }, [seasonId, user, tickerMap]);

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
                            <AssetSummary orders={orders} seasonId={seasonId} />
                            <HoldingsList orders={orders} />
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
