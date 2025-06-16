import React, { useState, useEffect, useContext } from "react";
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
import Loading from "../components/Loading.jsx";

export default function Investments() {
    const [activeTab, setActiveTab] = useState('보유자산');
    const [favoriteMarkets, setFavoriteMarkets] = useState([]);
    const [ownedMarkets, setOwnedMarkets] = useState([]);
    const [seasonId, setSeasonId] = useState(null);
    const [userAssets, setUserAssets] = useState([]);
    const [cash, setCash] = useState(0);

    const { user } = useContext(AuthContext);
    const {
        markets,
        tickerMap,
        selectedMarket,
        setSelectedMarket,
        isWsConnected
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

    // ✅ 시즌 ID와 사용자 ID로 보유자산 + 캐시 불러오기
    // ✅ 사용자 ID로 보유자산 + 캐시 불러오기 (seasonId 제거)
    useEffect(() => {
        if (!user?.id) return;

        api.get(`/assets`, { withCredentials: true })
            .then(res => {
                const data = res.data || {};
                setUserAssets(data.userAssets || []);
                setCash(data.cash || 0);

                // 보유 종목 심볼 추출
                const symbols = (data.userAssets || []).map(asset => asset.symbol);
                setOwnedMarkets(symbols);
            })
            .catch(err => {
                console.error("보유 자산 불러오기 실패:", err);
                setUserAssets([]);
                setCash(0);
                setOwnedMarkets([]);
            });

        // 즐겨찾기 불러오기
        api.get('/favorites', { params: { userId: user.id } })
            .then(res => setFavoriteMarkets(res.data))
            .catch(() => setFavoriteMarkets([]));

    }, [user]);


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
            {!isWsConnected && (
                <Loading/>
            )}
            <div className="main-content">
                <PortfolioHeader activeTab={activeTab} setActiveTab={setActiveTab} />

                <div className="tab-content">
                    {activeTab === '보유자산' && (
                        <>
                            <AssetSummary
                                userAssets={userAssets}
                                cash={cash}

                            />
                            <HoldingsList
                                userAssets={userAssets}

                            />
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
