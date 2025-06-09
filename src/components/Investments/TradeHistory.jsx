import { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../auth/AuthContext";
import { TickerContext } from "../../ticker/TickerProvider";
import api from "../../api/axiosConfig";

export default function TradeHistory() {
    const { user } = useContext(AuthContext);
    // const { tickerMap } = useContext(TickerContext);

    const [seasonOptions, setSeasonOptions] = useState([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState(null);
    const [selectedType, setSelectedType] = useState('전체');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [orders, setOrders] = useState([]);

    const typeMap = {
        전체: null,
        매수: "BUY",
        매도: "SELL"
    };

    useEffect(() => {
        api.get('/seasons')
            .then(res => {
                setSeasonOptions(res.data);
                setSelectedSeasonId(res.data[0]?.id || null);
            })
            .catch(err => console.error('시즌 목록 로딩 실패:', err));
    }, []);

    useEffect(() => {
        if (!selectedSeasonId || !user?.id) return;

        api.get(`/orders/${selectedSeasonId}`, { withCredentials: true })
            .then(res => setOrders(res.data))
            .catch(err => {
                console.error('주문 내역 로딩 실패:', err);
                setOrders([]);
            });
    }, [selectedSeasonId, user]);

    const filteredOrders = orders.filter(order => {
        const matchesType =
            !typeMap[selectedType] || order.orderType === typeMap[selectedType];

        const matchesSearch =
            searchKeyword === '' ||
            order.coinName?.includes(searchKeyword) ||
            order.symbol?.includes(searchKeyword);

        return matchesType && matchesSearch;
    });

    const selectedSeason = seasonOptions.find(s => s.id === selectedSeasonId);

    return (
        <div>
            <div className="filter-container">
                {/* 시즌 선택 섹션 */}
                <div className="season-select-container">
                    <label className="season-label">
                        시즌 선택
                        {selectedSeasonId && (() => {
                            const selected = seasonOptions.find(s => s.id === selectedSeasonId);
                            if (!selected) return null;
                            return (
                                <span className="season-period">
            &nbsp;({selected.startAt.slice(5, 10)} ~ {selected.endAt.slice(5, 10)})
          </span>
                            );
                        })()}
                    </label>
                    <select
                        className="season-select"
                        value={selectedSeasonId || ''}
                        onChange={(e) => setSelectedSeasonId(Number(e.target.value))}
                    >
                        {seasonOptions.map(season => (
                            <option key={season.id} value={season.id}>
                                {season.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* 매수/매도/전체 버튼 */}
                <div className="type-select-container">
                    <label className="season-label">종류</label>
                    <div className="type-buttons">
                        {['전체', '매수', '매도'].map(type => (
                            <button
                                key={type}
                                className={`filter-button ${selectedType === type ? 'active' : ''}`}
                                onClick={() => setSelectedType(type)}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 코인 검색 input */}
                <div className="coin-select-container">
                    <label className="season-label">코인 검색</label>
                    <input
                        type="text"
                        className="coin-search-input"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="예: 비트코인, BTC"
                    />
                </div>
            </div>

            {/* 🔹 주문 내역 테이블 */}
            <div className="holdings-list">
                <div className="holdings-table">
                    <div className="table-header">
                        <div className="col">코인명</div>
                        <div className="col">거래수량</div>
                        <div className="col">거래단가</div>
                        <div className="col">거래금액</div>
                        <div className="col">체결시간</div>
                        <div className="col">주문시간</div>
                    </div>

                    {filteredOrders.length === 0 ? (
                        <div className="table-row no-data">표시할 주문이 없습니다.</div>
                    ) : (
                        filteredOrders.map((order, idx) => (
                            <div key={idx} className="table-row">
                                <div className="col">{order.coinName}</div>
                                <div className="col">{order.amount}</div>
                                <div className="col">
                                    {order.tradePrice ? `${Number(order.tradePrice).toLocaleString()} KRW` : '-'}
                                </div>
                                <div className="col">
                                    {order.tradePrice
                                        ? `${(order.amount * order.tradePrice).toLocaleString()} KRW`
                                        : '-'}
                                </div>
                                <div className="col">
                                    {order.updatedAt?.slice(0, 19).replace('T', ' ')}
                                </div>
                                <div className="col">
                                    {order.createdAt?.slice(0, 19).replace('T', ' ')}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
