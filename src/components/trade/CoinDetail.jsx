import React, { useEffect, useState, useRef } from 'react';

const CoinDetail = () => {
    const [price, setPrice] = useState(null);
    const [status, setStatus] = useState('connecting');
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket('wss://api.upbit.com/websocket/v1');
        socketRef.current = ws;

        ws.onopen = () => {
            setStatus('open');
            ws.send(JSON.stringify([
                { ticket: 'bitground' },
                { type: 'ticker', codes: ['KRW-BTC'] }
            ]));
        };

        ws.onmessage = async (event) => {
            try {
                const text = await event.data.text();    // Blob → text
                const data = JSON.parse(text);
                if (typeof data.trade_price === 'number') {
                    setPrice(data.trade_price);
                }
            } catch (e) {
                console.error('메시지 처리 오류', e);
            }
        };

        ws.onerror = () => {
            setError('실시간 연결 오류');
            setStatus('error');
        };

        ws.onclose = () => {
            if (status !== 'error') {
                setTimeout(() => {
                    setStatus('connecting');
                    setError(null);
                    setPrice(null);
                }, 3000);
            }
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
        };
    }, [status]);

    return (
        <div className="bitcoin-ticker">
            <h2>비트코인 현재가</h2>
            {status === 'connecting' && price === null && (
                <div className="spinner">로딩 중…</div>
            )}
            {status === 'open' && price !== null && (
                <p>{Number(price).toLocaleString()} 원</p>
            )}
            {/*error는 토스트나 알림으로만 보여주고, 텍스트 잔상을 남기지 않기 */}
        </div>
    );
};

export default CoinDetail;
