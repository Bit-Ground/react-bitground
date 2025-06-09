// TradeHistory.jsx

import React, { useEffect, useRef, useState } from 'react';
import '../../styles/trade/TradeHistory.css';
import api from "../../api/axiosConfig.js";

export default function TradeHistory({ symbol }) {
    const [history, setHistory] = useState([]);
    const wsRef = useRef(null);
    const prevSymbolRef = useRef(null);

    // REST로 초기 100개 불러오기
    useEffect(() => {
        if (!symbol) return;
        api.get('/api/trade/history', { params: { symbol } })
            .then(res => setHistory(res.data))
            .catch(console.error);
    }, [symbol]);

    // WebSocket 연결 (component 마운트 시 한 번만)
    useEffect(() => {
        if (!symbol) return;

        const WS_BASE = import.meta.env.VITE_WS_URL;
        const ws = new WebSocket(`${WS_BASE}/ws/trade/history`);
        wsRef.current = ws;

        ws.onopen = () => {
            ws.send(JSON.stringify({ action: 'subscribe', symbol }));
            prevSymbolRef.current = symbol;
        };
        ws.onmessage = evt => {
            const newTrade = JSON.parse(evt.data);
            setHistory(prev => {
                const next = [...prev, newTrade];
                if (next.length > 100) next.shift(); // 최대 100개 유지
                return next;
            });
        };
        ws.onerror = console.error;

        return () => ws.close();
    }, []); // 빈 배열: 마운트될 때 딱 한 번

    // symbol 바뀔 때마다 구독/구독해제만 처리
    useEffect(() => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        // 이전에 구독하던 심볼 해제
        if (prevSymbolRef.current && prevSymbolRef.current !== symbol) {
            ws.send(JSON.stringify({ action: 'unsubscribe', symbol: prevSymbolRef.current }));
        }
        // 새로운 심볼 구독
        if (symbol && prevSymbolRef.current !== symbol) {
            ws.send(JSON.stringify({ action: 'subscribe', symbol }));
            setHistory([]); // 심볼 바뀔 때 기존 히스토리 비우기
            prevSymbolRef.current = symbol;
        }
    }, [symbol]);

    return (
        <div className="trade-history-wrapper">
            <h3>{symbol} – 체결 내역 (최근 {history.length}건)</h3>
            <ul className="trade-history-list">
                {history.map((t, idx) => {
                    // t 객체 안에 tradePrice나 amount 값이 없는 경우 대비
                    const timeString = t.createdAt
                        ? new Date(t.createdAt).toLocaleTimeString()
                        : '—:—:—';

                    // orderType 문자열이 없을 수도 있어서 기본값 붙여줌
                    const orderType = t.orderType || 'UNKNOWN';

                    // amount이 숫자가 아닐 경우 대비
                    const amountStr = typeof t.amount === 'number'
                        ? t.amount
                        : '—';

                    // tradePrice가 숫자가 아닐 경우 대비
                    const priceStr = typeof t.tradePrice === 'number'
                        ? t.tradePrice.toLocaleString()
                        : '—';

                    return (
                        <li key={idx}>
                            [{timeString}] {orderType} {amountStr} @ {priceStr}원
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
