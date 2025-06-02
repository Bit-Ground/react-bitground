import '../styles/Main.css';

import GbIndexChart from "../components/main/GbIndexChart.jsx";


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
                <h1>📊 업비트 시장 지수 대시보드</h1>
                <GbIndexChart  />
                {/*<GbmiChart />*/}
                {/*<GbaiChart />*/}
            </div>
            <div className={"rank-container"}>

            </div>
        </div>
    );
}