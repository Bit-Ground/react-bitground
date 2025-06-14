import React, {useContext, useEffect, useState} from "react";
import Sidebar from "../components/trade/Sidebar";
import CoinDetail from "../components/trade/CoinDetail";
import OrderBox from "../components/trade/OrderBox";
import TradeHistory from "../components/trade/TradeHistory";
import "../styles/trade/Trade.css";
import TradingViewWidget from "../components/trade/TradingViewWidget";
import api from "../api/axiosConfig.js";
import {AuthContext} from "../auth/AuthContext.js";
import {TickerContext} from "../ticker/TickerProvider.jsx";

export default function Trade() {
    const [favoriteMarkets, setFavoriteMarkets] = useState([]);
    const [owned, setOwned] = useState([]);
    const { user } = useContext(AuthContext)
    const { markets, selectedMarket, tickerMap, setSelectedMarket, isWsConnected } = useContext(TickerContext);
    const selectedMarketName = markets.find(m => m.market === selectedMarket)?.name;
    const [cash, setCash] = useState(user.cash);
    const [holdings, setHoldings] = useState('');
    const [orderTab, setOrderTab] = useState('BUY'); // BUY or SELL

    useEffect(() => {
        api.get('/api/favorites', { params: { userId: user.id } })
            .then(res => setFavoriteMarkets(res.data));
        api.get("/assets")
            .then(res => {
                setCash(res.data.cash);
            })
            .catch(console.error);
    }, [user.id]);

    useEffect(() => {
        if (!selectedMarket) return;
        api.get(`/assets/${selectedMarket}`)
            .then(res => {
                setHoldings(res.data.amount);
            })
            .catch(err => {
                console.error(err);
                setHoldings(0);
            });
    }, [selectedMarket]);

    const handleOrderPlaced = (newOrder) => {
        // 2) 사용자 보유 자산(잔고) 갱신
        api.get("/assets")
            .then(res => {
                // userAssets 배열에서 symbol 만 추출
                const symbols = res.data.userAssets.map(asset => asset.symbol);
                setOwned(symbols);
                setCash(res.data.cash);
                // 선택된 마켓의 자산 정보 갱신
                const selectedAsset = res.data.userAssets.find(asset => asset.symbol === selectedMarket);
                setHoldings(selectedAsset ? selectedAsset.amount : 0);
            })
            .catch(console.error);
    };

    const toggleFav = symbol => {
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

    useEffect(() => {
        if (!user?.id) return;
        api.get(`/assets/owned`)
            .then(res => setOwned(res.data))         // ex. ["KRW-BTC", "KRW-ETH", …]
            .catch(console.error);
    }, [user]);

    return (
        <div className="trade-page">
            {/* loading overlay */}
            {!isWsConnected && (
                <div className="loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}
            <div className="trade-page__content">
                <main className="main">
                    <section className="main__detail">
                        <div className="coin-detail">
                            <CoinDetail
                                market={selectedMarket}
                                marketName={selectedMarketName}
                                data={tickerMap[selectedMarket]}
                                favoriteMarkets={favoriteMarkets}
                                onToggleFav={toggleFav}
                            />
                        </div>
                        <div className="chart-widget">
                            <TradingViewWidget market={selectedMarket}/>
                        </div>
                    </section>
                    <div className="bottom-box-set">
                        <section className={`order-box ${orderTab === 'SELL' ? 'sell' : 'buy'}`}>
                            <OrderBox
                                tickerMap={tickerMap}
                                selectedMarket={selectedMarket}
                                onOrderPlaced={handleOrderPlaced}
                                cash={cash}
                                holdings={holdings}
                                onTradeTabChange={setOrderTab}
                            />
                        </section>
                        <section className="trade-history">
                            <TradeHistory
                                symbol={selectedMarket}/>
                        </section>
                    </div>
                </main>
                <aside className="sidebar">
                    <Sidebar
                        markets={markets}
                        tickerMap={tickerMap}
                        ownedMarkets={owned}
                        onSelectMarket={setSelectedMarket}
                        selectedMarket={selectedMarket}
                        favoriteMarkets={favoriteMarkets}
                        onToggleFav={toggleFav}
                    />
                </aside>
            </div>
        </div>
    );
}