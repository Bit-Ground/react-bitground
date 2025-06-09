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
            .then(res => {
                // API에서 이미 최신 순(desc)으로 반환됨
                const data = Array.isArray(res.data) ? res.data : [];
                setHistory(data);
            })
            .catch(console.error);
    }, [symbol]);

    // WebSocket 연결 (컴포넌트 마운트 시 한 번만)
    useEffect(() => {
        const WS_BASE = import.meta.env.VITE_WS_URL;
        const ws = new WebSocket(`${WS_BASE}/ws/trade/history`);
        wsRef.current = ws;

        ws.onopen = () => {
            if (!symbol) return;
            ws.send(JSON.stringify({ action: 'subscribe', symbol }));
            prevSymbolRef.current = symbol;
        };

        ws.onmessage = evt => {
            let msg;
            try {
                msg = JSON.parse(evt.data);
            } catch {
                return; // 파싱 불가 메시지 무시
            }
            if (msg.type === 'initial' && Array.isArray(msg.data)) {
                // 초기 데이터는 API와 같이 최신 순(desc) 유지
                setHistory(msg.data);
            }
            else if (msg.type === 'update' && msg.data) {
                const newTrade = msg.data;
                setHistory(prev => {
                    const next = [newTrade, ...prev];
                    if (next.length > 50) next.pop(); // 최대 50개 유지, 오래된 것부터 제거
                    return next;
                });
            }
        };

        ws.onerror = console.error;

        return () => ws.close();
    }, []);

    // symbol 변경 시 구독 해제/재구독
    useEffect(() => {
        const ws = wsRef.current;
        if (!ws || ws.readyState !== WebSocket.OPEN) return;

        const prev = prevSymbolRef.current;
        if (prev && prev !== symbol) {
            ws.send(JSON.stringify({ action: 'unsubscribe', symbol: prev }));
        }
        if (symbol && prev !== symbol) {
            ws.send(JSON.stringify({ action: 'subscribe', symbol }));
            setHistory([]);
            prevSymbolRef.current = symbol;
        }
    }, [symbol]);

    return (
        <div className="trade-history-wrapper">
            <h3>{symbol} – 체결 내역 (최근 {history.length}건)</h3>
            <ul className="trade-history-list">
                {history.map((t, idx) => {
                    const timeString = t.createdAt
                        ? new Date(t.createdAt).toLocaleTimeString()
                        : '—:—:—';
                    const orderType = t.orderType || 'UNKNOWN';
                    const amountStr = (typeof t.amount === 'number')
                        ? t.amount
                        : '—';
                    const priceStr = (typeof t.tradePrice === 'number')
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
