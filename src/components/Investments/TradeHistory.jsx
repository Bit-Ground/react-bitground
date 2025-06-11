import { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../auth/AuthContext";
import { TickerContext } from "../../ticker/TickerProvider"; // 추후 실시간 시세 활용 가능
import api from "../../api/axiosConfig";

// 🔢 숫자 포맷 유틸 함수 (소수점 자리 지정)
function formatNumber(value, digits = 2) {
    if (isNaN(value)) return '-';
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

// 🎯 업비트 기준 코인별 소수점 자릿수 지정
function getDecimalPlaces(symbol) {
    if (!symbol) return 0;
    if (symbol === 'BTC' || symbol === 'ETH') return 6;
    if (symbol === 'DOGE' || symbol === 'XRP') return 2;
    return 4; // 기본값
}

export default function TradeHistory() {
    const { user } = useContext(AuthContext);
    // const { tickerMap } = useContext(TickerContext); // 시세 연동 시 활용 가능

    const [seasonOptions, setSeasonOptions] = useState([]);          // 시즌 목록
    const [selectedSeasonId, setSelectedSeasonId] = useState(null);  // 선택한 시즌
    const [selectedType, setSelectedType] = useState('전체');        // 주문 유형
    const [searchKeyword, setSearchKeyword] = useState('');          // 검색어
    const [orders, setOrders] = useState([]);                        // 주문 내역

    const typeMap = {
        전체: null,
        매수: "BUY",
        매도: "SELL"
    };

    // 📅 시즌 목록 불러오기
    useEffect(() => {
        api.get('/seasons')
            .then(res => {
                setSeasonOptions(res.data);
                setSelectedSeasonId(res.data[0]?.id || null); // 첫 번째 시즌 선택
            })
            .catch(err => console.error('시즌 목록 로딩 실패:', err));
    }, []);

    // 📦 선택한 시즌의 주문 내역 불러오기
    useEffect(() => {
        if (!selectedSeasonId || !user?.id) return;

        api.get(`/orders/${selectedSeasonId}`, { withCredentials: true })
            .then(res => setOrders(res.data))
            .catch(err => {
                console.error('주문 내역 로딩 실패:', err);
                setOrders([]);
            });
    }, [selectedSeasonId, user]);

    // 🔍 필터 적용 (종류 + 검색어)
    const filteredOrders = orders.filter(order => {
        const matchesType = !typeMap[selectedType] || order.orderType === typeMap[selectedType];
        const matchesSearch =
            searchKeyword === '' ||
            order.coinName?.includes(searchKeyword) ||
            order.symbol?.includes(searchKeyword);
        return matchesType && matchesSearch;
    });

    return (
        <div>
            {/* 🎛️ 필터 영역 */}
            <div className="filter-container">
                {/* 🔽 시즌 선택 */}
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

                {/* 🔘 주문 유형 필터 */}
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

                {/* 🔍 검색창 */}
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

            {/* 📋 주문 내역 테이블 */}
            <div className="holdings-list">
                <div className="holdings-table">
                    {/* 🔒 고정 헤더 */}
                    <div className="table-header">
                        <div className="col">코인명</div>
                        <div className="col">거래수량</div>
                        <div className="col">거래단가</div>
                        <div className="col">거래금액</div>
                        <div className="col">체결시간</div>
                        <div className="col">주문시간</div>
                    </div>

                    {/* 🔁 스크롤 가능한 바디 */}
                    <div className="table-body">
                        {filteredOrders.length === 0 ? (
                            <div className="table-row no-data">표시할 주문이 없습니다.</div>
                        ) : (
                            filteredOrders.map((order, idx) => {
                                const symbol = order.symbol?.replace('KRW-', '') ?? '';
                                const decimal = getDecimalPlaces(symbol);
                                const quantity = Number(order.amount ?? 0);
                                const unitPrice = Number(order.tradePrice ?? 0);
                                const totalPrice = quantity * unitPrice;

                                return (
                                    <div
                                        key={idx}
                                        className={`table-row ${
                                            selectedType === '전체'
                                                ? order.orderType === 'BUY'
                                                    ? 'row-buy'
                                                    : order.orderType === 'SELL'
                                                        ? 'row-sell'
                                                        : ''
                                                : ''
                                        }`}
                                    >
                                        <div className="col">{order.coinName}</div>
                                        <div className="col">{formatNumber(quantity, decimal)}</div>
                                        <div className="col">
                                            {unitPrice > 0 ? `${formatNumber(unitPrice)} KRW` : '-'}
                                        </div>
                                        <div className="col">
                                            {unitPrice > 0 ? `${formatNumber(totalPrice)} KRW` : '-'}
                                        </div>
                                        <div className="col">
                                            {order.updatedAt?.slice(0, 19).replace('T', ' ')}
                                        </div>
                                        <div className="col">
                                            {order.createdAt?.slice(0, 19).replace('T', ' ')}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}
