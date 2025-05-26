import React from "react";
import Header from "../layout/Header";
import Sidebar from "../components/trade/Sidebar";
import CoinDetail from "../components/trade/CoinDetail";
import TradingViewWidget from "../components/trade/TradingViewWidget.jsx";
import OrderBox from "../components/trade/OrderBox";
import TradeHistory from "../components/trade/TradeHistory";
import "./Trade.css";
import BitcoinTicker from "../components/BitcoinTicker.jsx";

export default function Trade() {
    return (
        <div className="trade-page">
            {/*<Header />*/}

            <div className="trade-page__content">


                <main className="main">
                    <section className="main__detail">
                        <div className="coin-detail">
                            <BitcoinTicker />
                        </div>
                        <div className="chart-widget">
                            <TradingViewWidget />
                        </div>
                    </section>

                    <section className="order-box">
                        <OrderBox />
                    </section>

                    <section className="trade-history">
                        <TradeHistory />
                    </section>
                </main>
                <aside className="sidebar">
                    <Sidebar />
                </aside>
            </div>
        </div>
    );
}