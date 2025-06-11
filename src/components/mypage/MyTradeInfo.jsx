import React, { useEffect, useState } from "react";
import '../../styles/mypage/MyTradeInfo.css';
import MyTradeAI from "./MyTradeAI.jsx";
import { fetchTradeSummary } from "../../api/fetchTradeSummary.js";
import api from "../../api/axiosConfig.js";
import Loading from "../Loading.jsx";

export default function MyTradeInfo() {
    const [tab, setTab] = useState('분석');
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    // 시즌 목록 가져오기
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const res = await api.get('/seasons');
                const completedSeasons = res.data.filter(s => s.status === 'COMPLETED');
                setSeasons(completedSeasons);
                if (completedSeasons.length > 0) {
                    setSelectedSeason(completedSeasons[0].id);
                }
            } catch (err) {
                console.error("시즌 목록 불러오기 실패", err);
            }
        };
        fetchSeasons();
    }, []);

    // 선택된 시즌 요약 가져오기 (fetchTradeSummary 사용)
    useEffect(() => {
        const fetchSummary = async () => {
            if (!selectedSeason) return;
            setLoading(true);
            try {
                const data = await fetchTradeSummary(selectedSeason);
                setSummary(data);
            } catch (err) {
                console.error("거래 요약 불러오기 실패", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [selectedSeason]);

    return (
        <div className="season-container">
            <div className="season-header">
                <div className="season-header-top">
                    <div>
                        <span>{seasons.find(s => s.id === selectedSeason)?.name}</span>
                        ({seasons.find(s => s.id === selectedSeason)?.startAt?.substring(0, 10)} ~ {seasons.find(s => s.id === selectedSeason)?.endAt?.substring(0, 10)})
                    </div>
                    <div className="season-header-info">
                        <select value={selectedSeason || ''} onChange={e => setSelectedSeason(Number(e.target.value))}>
                            {seasons.map(season => (
                                <option key={season.id} value={season.id}>{season.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="season-menu">
                    <button onClick={() => setTab('분석')} className={tab === '분석' ? 'active' : ''}>시즌분석</button>
                    <button onClick={() => setTab('상세')} className={tab === '상세' ? 'active' : ''}>상세내역</button>
                </div>
            </div>

            {loading ? <Loading/> : tab === '분석' ? (
                <div className="season-analysis">
                    <MyTradeAI/>
                    <div>
                        <table>
                            <thead>
                            <tr>
                                <th style={{width: '40%'}}>항목</th>
                                <th>분석 결과</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr><td>최다 투자 종목</td><td>-</td></tr>
                            <tr><td>최고 수익 종목</td><td>-</td></tr>
                            <tr><td>최저 수익 종목</td><td>-</td></tr>
                            <tr><td>총 거래 횟수</td><td>-</td></tr>
                            <tr><td>총 투자 금액</td><td>-</td></tr>
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
                        {summary.map((item, i) => (
                            <tr key={i}>
                                <td>{item.koreanName} ({item.coin})</td>
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
                </div>
            )}
        </div>
    );
}