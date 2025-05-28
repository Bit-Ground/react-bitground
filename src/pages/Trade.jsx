import React, {useEffect, useRef, useState} from "react";
import Sidebar from "../components/trade/Sidebar";
import CoinDetail from "../components/trade/CoinDetail";
import OrderBox from "../components/trade/OrderBox";
import TradeHistory from "../components/trade/TradeHistory";
import "../styles/trade/Trade.css";
import TradingViewWidget from "../components/trade/TradingViewWidget";
import api from "../api/axiosConfig.js";

export default function Trade() {
    const [markets, setMarkets] = useState([]);
    const [tickerMap, setTickerMap] = useState({});
    const [selectedMarket, setSelected] = useState(null);
    const wsRef = useRef(null);
    const selectedMarketName = markets.find(m => m.market === selectedMarket)?.name;

    // (1) markets 불러오기
    useEffect(() => {
        api.get('/api/coin-symbols')
            .then(res => {
                const krw = res.data.map(c => ({
                    market: c.symbol,
                    name:   c.koreanName
                }));
                setMarkets(krw);
                setSelected('KRW-BTC');
            })
            .catch(err => {
                console.error('코인 목록 로드 실패:', err);
            });
    }, []);

    // (2) WebSocket 구독
    useEffect(() => {
        if (!markets.length) return;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host     = window.location.host;
        const ws       = new WebSocket(`${protocol}://${host}/upbit-ws/`);

        ws.binaryType = 'blob';
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify([
                { ticket: 'bitground' },
                { type: 'ticker', codes: markets.map(m => m.market) }
            ]));
        };

        ws.onmessage = async e => {
            const text = typeof e.data === 'string' ? e.data : await e.data.text();
            const msg  = JSON.parse(text);
            const tick = Array.isArray(msg) ? msg[0] : msg;
            setTickerMap(prev => ({
                ...prev,
                [tick.code]: {
                    price:      tick.trade_price,
                    changeAmt:  tick.signed_change_price,
                    changeRate: tick.signed_change_rate,
                    volume:     tick.acc_trade_price_24h,
                    high:       tick.high_price,
                    low:        tick.low_price
                }
            }));
        };

        ws.onerror = console.error;
        return () => ws.close();
    }, [markets]);

    return (
        <div className="trade-page">
            {/*<Header />*/}

            <div className="trade-page__content">


                <main className="main">
                    <section className="main__detail">
                        <div className="coin-detail">
                            <CoinDetail
                                market={selectedMarket}
                                marketName={selectedMarketName}
                                data={tickerMap[selectedMarket]}
                            />
                        </div>
                        <div className="chart-widget">
                            <TradingViewWidget market={selectedMarket}/>
                        </div>
                    </section>
                    <div className="bottom-box-set">
                        <section className="order-box">
                            <OrderBox/>
                        </section>
                        <section className="trade-history">
                            <TradeHistory/>
                        </section>
                    </div>
                </main>
                <aside className="sidebar">
                    <Sidebar
                        markets={markets}
                        tickerMap={tickerMap}
                        onSelectMarket={setSelected}
                        selectedMarket={selectedMarket}
                    />
                </aside>
            </div>
        </div>
    );
}