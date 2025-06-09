import '../styles/Main.css';
import MarketChart from "../components/main/MarketChart.jsx";
import AltChart from "../components/main/AltChart.jsx";



export default function Main() {

    return (
        <div className="main-container">
            <div className={"banner-container"}>
                <div className={"text-banner"}>Invest everything</div>
                <div className={"mask-wrapper"}>
                    <div className={"banner-back"}>
                        <div className={"ipad"}>
                            <div className={"ipad-screen"}></div>
                        </div>
                    </div>
                </div>
            </div>
            <div className={"market-price-container"}>
                <MarketChart />
                <AltChart />
            </div>
            <div className={"rank-container"}>
                ㅋㅋ
            </div>
        </div>
    );
}