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
import '../styles/Investments.css';
import "../styles/trade/Trade.css";

export default function Investments() {
    const [activeTab, setActiveTab] = useState('보유자산');
    const [favoriteMarkets, setFavoriteMarkets] = useState([]);
    const [ownedMarkets, setOwnedMarkets] = useState([]);
    const [seasonId, setSeasonId] = useState(null); // ✅ 하드코딩 제거
    const [orders, setOrders] = useState([]);

    const { user } = useContext(AuthContext);
    const {
        markets,
        tickerMap,
        selectedMarket,
        setSelectedMarket,
    } = useContext(TickerContext);

    // ✅ 현재 시즌 ID 불러오기
    useEffect(() => {
        const fetchSeasonId = async () => {
            try {
                const res = await api.get("/seasons/current-id");
                setSeasonId(res.data);
            } catch (e) {
                console.error("현재 시즌 ID 불러오기 실패", e);
            }
        };
        fetchSeasonId();
    }, []);

    // ✅ 시즌 ID와 사용자 ID로 주문/보유 종목 불러오기
    useEffect(() => {
        if (!seasonId || !user?.id) return;

        // 즐겨찾기 불러오기
        api.get('/favorites', { params: { userId: user.id } })
            .then(res => setFavoriteMarkets(res.data))
            .catch(() => setFavoriteMarkets([]));

        // 주문 내역 + 보유 종목 계산
        api.get(`/orders/${seasonId}`, { withCredentials: true })
            .then(res => {
                const orders = res.data || [];
                setOrders(orders);

                // 🔄 매수/매도 정산해서 실제 보유량이 있는 종목만 필터링
                const holdingMap = new Map();

                orders.forEach(order => {
                    const symbol = order.symbol;
                    const qty = Number(order.amount) || 0;
                    const type = order.orderType;

                    if (!holdingMap.has(symbol)) holdingMap.set(symbol, 0);

                    if (type === 'BUY') {
                        holdingMap.set(symbol, holdingMap.get(symbol) + qty);
                    } else if (type === 'SELL') {
                        holdingMap.set(symbol, holdingMap.get(symbol) - qty);
                    }
                });

                const owned = Array.from(holdingMap.entries())
                    .filter(([_, qty]) => qty > 0)
                    .map(([symbol]) => symbol);

                setOwnedMarkets(owned);
            })
            .catch(err => {
                console.error('보유 종목 불러오기 실패:', err);
                setOrders([]);
                setOwnedMarkets([]); // 실패 시 초기화
            });
    }, [seasonId, user]);

    // ✅ 실시간 시세 기반 주문 정보 보정
    useEffect(() => {
        if (!orders.length || !tickerMap) return;

        const enriched = orders.map(order => {
            const marketCode = `KRW-${order.symbol}`;
            const currentPrice = tickerMap[marketCode]?.price || 0;
            return {
                ...order,
                currentPrice
            };
        });

        setOrders(enriched);
    }, [tickerMap]);

    const toggleFavorite = (symbol) => {
        const isFav = favoriteMarkets.includes(symbol);
        const req = isFav
            ? api.delete(`/favorites/${symbol}`, { params: { userId: user.id } })
            : api.post('/favorites', null, { params: { userId: user.id, symbol } });
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
                            <HoldingsList orders={orders} seasonId={seasonId} />
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
