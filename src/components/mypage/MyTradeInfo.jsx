import React, {useState} from "react";
import '../../styles/mypage/MyTradeInfo.css'

const sampleSeason = {
    season: '시즌 5',
    period: '2025.05.01 ~ 2025.05.14',
    rank: '12위 / 300명',
    asset: '12,345,000원',
    returnRate: '+23.45%',
};

const sampleSummary = [
    {
        coin: 'BTC',
        buyDate: '05-02',
        buyAmount: 3000000,
        sellAmount: 3450000,
        avgBuy: 37500000,
        avgSell: 43125000,
        returnRate: '+15%',
        profit: 450000,
    },
];

const sampleDetails = [
    {
        date: '05-02',
        type: '매수',
        qty: '0.08 BTC',
        price: 37500000,
        total: 3000000,
    },
];

const sampleAiAnalysis = [
    { category: '최다 투자 종목', value: 'BTC' },
    { category: '최고 수익 종목', value: 'ETH (+18%)' },
    { category: '최저 수익 종목', value: 'XRP (-12%)' },
    { category: '총 거래 횟수', value: '18회' },
    { category: '총 투자 금액', value: '9,500,000원' },
];

export default function MyTradeInfo() {
    const [tab, setTab] = useState('분석');

    return (
        <div className="season-container">
            {/* 고정 헤더 */}
            <div className="season-header">
                <div className="season-header-top">
                    <div>
                        <span>{sampleSeason.season}</span> ({sampleSeason.period})
                    </div>
                    <div className="season-header-info">
                        <span>🏅 {sampleSeason.rank}</span>
                        <span>💰 {sampleSeason.asset}</span>
                        <select>
                            <option>시즌 5</option>
                            <option>시즌 4</option>
                            <option>시즌 3</option>
                        </select>
                    </div>
                </div>

                <div className="season-menu">
                    <button onClick={() => setTab('분석')} className={tab === '분석' ? 'active' : ''}>시즌분석</button>
                    <button onClick={() => setTab('상세')} className={tab === '상세' ? 'active' : ''}>상세내역</button>
                </div>
            </div>

            {/* 탭 내용 */}
            {tab === '분석' ? (
                <div className="season-analysis">
                    <div className="season-ai-box">
                        🔍 AI 기반 시즌 투자 분석 내용 들어갈 자리입니다.
                    </div>
                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th>항목</th>
                                <th>분석 결과</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sampleAiAnalysis.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.category}</td>
                                    <td>{item.value}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="season-details">
                    <h2>시즌별 투자내역</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>종목</th><th>최초매수일</th><th>총매수금액</th><th>총매도금액</th>
                            <th>평균매수가</th><th>평균매도가</th><th>수익률</th><th>수익금</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sampleSummary.map((item, i) => (
                            <tr key={i}>
                                <td>{item.coin}</td>
                                <td>{item.buyDate}</td>
                                <td>{item.buyAmount.toLocaleString()}</td>
                                <td>{item.sellAmount.toLocaleString()}</td>
                                <td>{item.avgBuy.toLocaleString()}</td>
                                <td>{item.avgSell.toLocaleString()}</td>
                                <td>{item.returnRate}</td>
                                <td>{item.profit.toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    <h2>상세 거래 내역</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>일자</th><th>종류</th><th>수량</th><th>단가</th><th>금액</th>
                        </tr>
                        </thead>
                        <tbody>
                        {sampleDetails.map((item, i) => (
                            <tr key={i}>
                                <td>{item.date}</td>
                                <td>{item.type}</td>
                                <td>{item.qty}</td>
                                <td>{item.price.toLocaleString()}</td>
                                <td>{item.total.toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}