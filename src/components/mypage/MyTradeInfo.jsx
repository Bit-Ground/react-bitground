import React, { useEffect, useState } from "react";
import '../../styles/mypage/MyTradeInfo.css';
import MyTradeAI from "./MyTradeAI.jsx";
import { fetchTradeSummary } from "../../api/fetchTradeSummary.js";
import { fetchTradeDetails } from "../../api/fetchTradeDetails.js";
import api from "../../api/axiosConfig.js";
import Loading from "../Loading.jsx";

export default function MyTradeInfo() {
    const [tab, setTab] = useState('분석');
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [summary, setSummary] = useState([]);
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [analysis, setAnalysis] = useState({
        topCoin: '-',
        bestProfitCoin: '-',
        worstProfitCoin: '-',
        totalTrades: 0,
        totalInvested: 0
    });

    // 시즌 목록 로딩
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

    // 요약 + 상세 데이터 동시 로딩
    useEffect(() => {
        const fetchAll = async () => {
            if (!selectedSeason) return;
            setLoading(true);
            try {
                const [summaryData, detailData] = await Promise.all([
                    fetchTradeSummary(selectedSeason),
                    fetchTradeDetails(selectedSeason)
                ]);
                setSummary(summaryData);
                setDetails(detailData);

                // ✅ 분석도 여기서 업데이트
                if (summaryData.length === 0) {
                    setAnalysis({
                        topCoin: '-',
                        bestProfitCoin: '-',
                        worstProfitCoin: '-',
                        totalTrades: 0,
                        totalInvested: 0
                    });
                } else {
                    const totalTrades = detailData.length;
                    const totalInvested = summaryData.reduce((acc, cur) => acc + cur.buyAmount, 0);
                    const topCoin = summaryData.reduce((prev, curr) =>
                        curr.buyAmount > prev.buyAmount ? curr : prev, summaryData[0]).koreanName;
                    const bestProfitCoin = summaryData.reduce((prev, curr) =>
                        curr.profit > prev.profit ? curr : prev, summaryData[0]).koreanName;
                    const worstProfitCoin = summaryData.reduce((prev, curr) =>
                        curr.profit < prev.profit ? curr : prev, summaryData[0]).koreanName;

                    setAnalysis({
                        topCoin,
                        bestProfitCoin,
                        worstProfitCoin,
                        totalTrades,
                        totalInvested
                    });
                }
            } catch (err) {
                console.error("요약 또는 상세 거래내역 불러오기 실패", err);
                // 실패했을 때도 초기화
                setSummary([]);
                setDetails([]);
                setAnalysis({
                    topCoin: '-',
                    bestProfitCoin: '-',
                    worstProfitCoin: '-',
                    totalTrades: 0,
                    totalInvested: 0
                });
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [selectedSeason]);

    useEffect(() => {
        if (!summary.length || !details.length) return;

        // 최다 투자 종목
        const top = [...summary].sort((a, b) => b.buyAmount - a.buyAmount)[0];

        // 최고 수익 종목
        const best = [...summary].sort((a, b) => b.profit - a.profit)[0];

        // 최저 수익 종목
        const worst = [...summary].sort((a, b) => a.profit - b.profit)[0];

        // 총 거래 횟수
        const totalTrades = details.length;

        // 총 투자 금액 (매수만)
        const totalInvested = details
            .filter(d => d.type === '매수')
            .reduce((sum, d) => sum + d.total, 0);

        setAnalysis({
            topCoin: top?.koreanName || '-',
            bestProfitCoin: best ? `${best.koreanName} (${best.returnRate})` : '-',
            worstProfitCoin: worst ? `${worst.koreanName} (${worst.returnRate})` : '-',
            totalTrades,
            totalInvested
        });

    }, [summary, details]);

    return (
        <div className="season-container">
            <div className="season-header">
                <div className="season-header-top">
                    <div>
                        {(() => {
                            const selected = seasons.find(s => s.id === selectedSeason);
                            if (!selected) return <span className={"season-header-title"}>시즌 정보 없음</span>;
                            return (
                                <div className={"season-header-title"}>
                                    {selected.name}<div>({selected.startAt?.substring(0, 10)} ~ {selected.endAt?.substring(0, 10)})</div>
                                </div>
                            );
                        })()}
                    </div>
                    <div className="season-header-info">
                        <div className="season-rank">
                            {(() => {
                                const selected = seasons.find(s => s.id === selectedSeason);
                                if (!selected || selected.rank == null) {
                                    return <span>🏅 랭킹 정보 없음</span>;
                                }
                                return <span>{selected.rank}</span>;
                            })()}
                        </div>
                        <select
                            value={selectedSeason || ''}
                            onChange={e => setSelectedSeason(Number(e.target.value))}
                        >
                            {seasons.map(season => (
                                <option key={season.id} value={season.id}>
                                    {season.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="season-menu">
                    <button onClick={() => setTab('분석')} className={tab === '분석' ? 'active' : ''}>시즌분석</button>
                    <button onClick={() => setTab('상세')} className={tab === '상세' ? 'active' : ''}>상세내역</button>
                </div>
            </div>
            {loading ? <Loading /> : tab === '분석' ? (
                <div className="season-analysis">
                    <MyTradeAI />
                    <div>
                        <table>
                            <thead>
                            <tr><th style={{ width: '40%' }}>항목</th><th>분석 결과</th></tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>최다 투자 종목</td>
                                <td>{analysis.topCoin}</td>
                            </tr>
                            <tr>
                                <td>최고 수익 종목</td>
                                <td>{analysis.bestProfitCoin}</td>
                            </tr>
                            <tr>
                                <td>최저 수익 종목</td>
                                <td>{analysis.worstProfitCoin}</td>
                            </tr>
                            <tr>
                                <td>총 거래 횟수</td>
                                <td>{analysis.totalTrades.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>총 투자 금액</td>
                                <td>{analysis.totalInvested.toLocaleString()}원</td>
                            </tr>
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

                    <h2 style={{ marginTop: '2rem' }}>상세 거래내역</h2>
                    <table>
                        <thead>
                        <tr>
                            <th>거래일자</th><th>종목</th><th>종류</th><th>수량</th><th>단가</th><th>금액</th>
                        </tr>
                        </thead>
                        <tbody>
                        {details.map((d, i) => (
                            <tr key={i}>
                                <td>{d.date || '-'}</td>
                                <td>{d.koreanName || '-'}</td>
                                <td>{d.type || '-'}</td>
                                <td>{Number(d.qty?.split(" ")[0] || 0).toLocaleString()}</td>
                                <td>{Number(d.price).toLocaleString()}</td>
                                <td>{Number(d.total).toLocaleString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}