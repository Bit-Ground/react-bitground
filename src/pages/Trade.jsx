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
import {useToast} from "../components/Toast.jsx";
import Loading from "../components/Loading.jsx";

export default function Trade() {
    const [favoriteMarkets, setFavoriteMarkets] = useState([]);
    const [owned, setOwned] = useState([]);
    const {user} = useContext(AuthContext)
    const {markets, selectedMarket, tickerMap, setSelectedMarket, isWsConnected} = useContext(TickerContext);
    const selectedMarketName = markets.find(m => m.market === selectedMarket)?.name;
    const [cash, setCash] = useState(user.cash);
    const [holdings, setHoldings] = useState('');
    const [orderTab, setOrderTab] = useState('BUY'); // BUY or SELL
    const [userAssets, setUserAssets] = useState({});

    const { userCash } = useToast();

    const handleOrderPlaced = () => {
        // 2) 사용자 보유 자산(잔고) 갱신
        api.get("/assets")
            .then(res => {
                // userAssets 배열에서 symbol 만 추출
                const symbols = res.data.userAssets.map(asset => asset.symbol);
                // 보유중 코인 업데이트
                setOwned(symbols);
                // 현금 잔고 업데이트
                setCash(res.data.cash);
                // 사용자 자산을 맵으로 변환 (symbol이 키, 나머지 정보가 값)
                const userAssetsMap = res.data.userAssets.reduce((acc, asset) => {
                    acc[asset.symbol] = {amount: asset.amount, avgPrice: asset.avgPrice};
                    return acc;
                }, {});
                // userAssets 상태 업데이트
                setUserAssets(userAssetsMap);
            })
            .catch(console.error);
    };

    useEffect(() => {
        if (userCash === 0) return;
        // 예약 주문이 완료되면 자산 정보 갱신
        handleOrderPlaced();
    }, [userCash]);


    useEffect(() => {
        api.get('/favorites', {params: {userId: user.id}})
            .then(res => setFavoriteMarkets(res.data));
        handleOrderPlaced(); // 초기 자산 정보 로딩
    }, [user.id]);

    useEffect(() => {
        if (!selectedMarket) return;
        // 선택된 마켓의 자산 정보 갱신
        setHoldings(userAssets[selectedMarket]?.amount || 0);
    }, [selectedMarket, userAssets]);


    const toggleFav = symbol => {
        const isFav = favoriteMarkets.includes(symbol);
        const req = isFav
            ? api.delete(`/favorites/${symbol}`, {params: {userId: user.id}})
            : api.post('/favorites', null, {params: {userId: user.id, symbol}});

        req.then(() => {
            setFavoriteMarkets(prev =>
                isFav ? prev.filter(s => s !== symbol) : [...prev, symbol]
            );
        });
    };

    return (
        <div className="trade-page">
            {/* loading overlay */}
            {!isWsConnected && (
                <Loading/>
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