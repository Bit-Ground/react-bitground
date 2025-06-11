// TradeHistory.jsx
import React, {useEffect, useRef, useState} from 'react';
import api from "../../api/axiosConfig.js";
import "../../styles/trade/TradeHistory.css"

export default function TradeHistory({symbol}) {
    const [history, setHistory] = useState([]);
    const wsRef = useRef(null);
    const prevSymbolRef = useRef(null);

    // 1) 초기 REST 호출
    useEffect(() => {
        if (!symbol) return;
        api.get('/api/trade/history', {params: {symbol}})
            .then(res => setHistory(res.data))
            .catch(console.error);
    }, [symbol]);

    // 2) WebSocket 연결 (마운트 시 단 한 번만)
    useEffect(() => {
        // const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        // const ws = new WebSocket(
        //     `${protocol}://${window.location.host}/ws/trade/history`
        // );
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${proto}://${window.location.host}/ws/trade/history`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            if (symbol) {
                ws.send(JSON.stringify({action: 'subscribe', symbol}));
                prevSymbolRef.current = symbol;
            }
        };
        ws.onmessage = evt => {
            let msg;
            try {
                msg = JSON.parse(evt.data);
            } catch {
                return;
            }
            // 초기 메시지(type:"initial")는 data 배열, 업데이트(type:"update")는 data 객체
            const payload = msg.type === 'initial'
                ? msg.data
                : [msg.data];
            setHistory(prev => {
                // "initial"일 땐 전체 덮어쓰기, "update"일 땐 새 항목만 앞에 추가
                const next = msg.type === 'initial'
                    ? payload
                    : [payload[0], ...prev];
                return next.slice(0, 100); // 최신 100개만 유지
            });
        };
        ws.onerror = console.error;

        return () => ws.close();
    }, []); // 빈 deps

    // 3) symbol 변경 시 subscribe/unsubscribe
    useEffect(() => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        // 전에 구독하던 건 해제
        if (prevSymbolRef.current && prevSymbolRef.current !== symbol) {
            ws.send(JSON.stringify({
                action: 'unsubscribe',
                symbol: prevSymbolRef.current
            }));
        }
        // 새 심볼 구독
        if (symbol && prevSymbolRef.current !== symbol) {
            ws.send(JSON.stringify({action: 'subscribe', symbol}));
            setHistory([]); // 화면 전환 시 초기화
            prevSymbolRef.current = symbol;
        }
    }, [symbol]);

    return (
        <div className="trade-history-wrapper">
            <h3>{symbol} – 체결 내역 (최근 {history.length}건)</h3>
            <table className="trade-history-table">
                <thead>
                <tr>
                    <th>시간</th>
                    <th>종류</th>
                    <th>수량</th>
                    <th>단가 (원)</th>
                </tr>
                </thead>
                <tbody>
                {history.map((t, i) => {
                    const time = t.createdAt
                        ? new Date(t.createdAt).toLocaleTimeString()
                        : '—:—:—';
                    const amt = typeof t.amount === 'number' ? t.amount : '—';
                    const price = typeof t.tradePrice === 'number'
                        ? t.tradePrice.toLocaleString()
                        : '—';
                    const rowClass = t.orderType === 'SELL' ? 'row-sell' : 'row-buy'; // 매수 = SELL = 빨강, 매도 = BUY = 파랑

                    return (
                        <tr key={i} className={rowClass}>
                            <td>{time}</td>
                            <td>{t.orderType === 'SELL' ? '매수' : '매도'}</td>
                            <td>{amt}</td>
                            <td>{price}원</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
