import React, {useEffect, useRef, useState} from 'react';

export default function Sidebar() {
    const [markets, setMarkets] = useState([]);
    const [tickerMap, setTickerMap] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [sortKey, setSortKey] = useState('name');       // 기본 정렬: 이름
    const [sortOrder, setSortOrder] = useState('asc');        // asc or desc
    const wsRef = useRef(null);

    // 1) 시장 코드 + 한글이름 불러오기
    useEffect(() => {
        fetch('https://api.upbit.com/v1/market/all?isDetails=false')
            .then(res => res.json())
            .then(data => {
                const krw = data
                    .filter(item => item.market.startsWith('KRW-'))
                    .map(item => ({
                        market: item.market,
                        name: item.korean_name
                    }));
                setMarkets(krw);
            })
            .catch(console.error);
    }, []);

    // 2) WebSocket 구독
    useEffect(() => {
        if (markets.length === 0) return;

        const ws = new WebSocket('wss://api.upbit.com/websocket/v1');
        wsRef.current = ws;
        // Blob → 텍스트를 바로 쓸 수 있게
        ws.binaryType = 'blob';

        ws.onopen = () => {
            ws.send(JSON.stringify([
                {ticket: 'bitground'},
                {
                    type: 'ticker',
                    codes: markets.map(m => m.market)
                }
            ]));
        };

        ws.onmessage = async e => {
            try {
                // 문자열이면 그대로, Blob이면 .text()
                const text = typeof e.data === 'string'
                    ? e.data
                    : await e.data.text();

                const parsed = JSON.parse(text);
                // 항상 배열로 옵니다.
                const tick = Array.isArray(parsed) ? parsed[0] : parsed;
                setTickerMap(prev => ({
                    ...prev,
                    [tick.code]: {
                        price: tick.trade_price,
                        changeAmt: tick.signed_change_price,
                        changeRate: tick.signed_change_rate,
                        volume: tick.acc_trade_price_24h
                    }
                }));
                // console.log(tick.market.price)
            } catch (err) {
                // 파싱 에러는 무시
            }
        };

        ws.onerror = console.error;
        return () => ws.close();
    }, [markets]);

    // 전일 대비 컬러
    const getColor = (amt) => {
        if (amt > 0) return '#fc0754';
        if (amt < 0) return '#3EB2FF';
        return '#343434';
    };

    // 정렬 함수
    const compare = (a, b) => {
        let va, vb;
        switch (sortKey) {
            case 'price':
                va = tickerMap[a.market]?.price ?? 0;
                vb = tickerMap[b.market]?.price ?? 0;
                break;
            case 'changeAmt':
                va = tickerMap[a.market]?.changeAmt ?? 0;
                vb = tickerMap[b.market]?.changeAmt ?? 0;
                break;
            default: // name
                va = a.name;
                vb = b.name;
        }
        if (va < vb) return sortOrder === 'asc' ? -1 : 1;
        if (va > vb) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    };

    // 헤더 클릭 시 정렬 설정
    const onSort = key => {
        if (sortKey === key) {
            // 같은 키 클릭하면 토글
            setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

    // 렌더링할 리스트: 검색+정렬
    const displayList = markets
        .filter(({name, market}) =>
            name.includes(searchTerm) || market.includes(searchTerm)
        )
        .sort(compare);

    return (
        <div className="ticker-table__wrapper">
            {/* 검색창 */}
            <input
                className={"trade-search"}
                type="text"
                placeholder="코인명 또는 마켓 검색…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <table className="ticker-table">
                <thead>
                <th>
                    한글명
                </th>
                <th
                    onClick={() => onSort('price')}
                >
                    현재가 {sortKey === 'price' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                <th
                    onClick={() => onSort('changeAmt')}
                >
                    전일대비 {sortKey === 'changeAmt' && (sortOrder === 'asc' ? '▲' : '▼')}
                </th>
                </thead>
                <tbody>
                {displayList.map(({market, name}) => {
                    const t = tickerMap[market] || {};
                    const price = t.price != null
                        ? Number(t.price).toLocaleString()
                        : '—';
                    const changeRate = t.changeRate != null
                        ? `${(t.changeRate * 100).toFixed(2)}%`
                        : '—';
                    const changeAmt = t.changeAmt != null
                        ? Number(t.changeAmt).toLocaleString()
                        : '—';
                    const color = t.changeAmt != null
                        ? getColor(t.changeAmt)
                        : 'black';
                    return (
                        <tr key={market}>
                            <td className="cell-name">
                                {name}
                                <br/>
                                <span className="cell-market">{market}</span>
                            </td>
                            <td className="cell-price" style={{color}}>{price}</td>
                            <td className={"cell-change"}>
                                <p style={{color}}>{changeRate}</p>
                                <em style={{color}}>({changeAmt})</em>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
