import { useState, useEffect, useContext } from 'react';
import { AuthContext } from "../../auth/AuthContext";
import { TickerContext } from "../../ticker/TickerProvider"; // 실시간 시세 연동용 (현재 미사용)
import api from "../../api/axiosConfig";

// 🔢 숫자 포맷 함수 (소수점 자리 및 0 제거 설정 가능)
function formatNumber(value, digits = 2, trimZeros = true) {
    if (isNaN(value)) return '-';

    const num = Number(value);
    const formatted = num.toLocaleString(undefined, {
        minimumFractionDigits: trimZeros ? 0 : digits,
        maximumFractionDigits: digits,
    });

    return formatted;
}

// 💰 금액 포맷 함수 (단위: KRW)
function formatCurrency(value, digits = 0) {
    if (isNaN(value)) return '-';
    return `${formatNumber(value, digits, true)} `;
}

// 🎯 업비트 기준 코인별 소수점 자릿수 설정
function getDecimalPlaces(symbol) {
    if (!symbol) return 0;
    if (symbol === 'BTC' || symbol === 'ETH') return 6;
    if (symbol === 'DOGE' || symbol === 'XRP') return 2;
    return 4; // 기본값
}

export default function TradeHistory() {
    const { user } = useContext(AuthContext); // 로그인 사용자 정보
    // const { tickerMap } = useContext(TickerContext); // 실시간 시세 (사용 시 주석 해제)

    const [seasonOptions, setSeasonOptions] = useState([]);          // 시즌 목록
    const [selectedSeasonId, setSelectedSeasonId] = useState(null);  // 선택된 시즌 ID
    const [selectedType, setSelectedType] = useState('전체');        // 주문 타입 필터
    const [searchKeyword, setSearchKeyword] = useState('');          // 검색어
    const [orders, setOrders] = useState([]);                        // 주문 내역 리스트

    // 주문 타입 필터용 맵
    const typeMap = {
        전체: null,
        매수: "BUY",
        매도: "SELL"
    };

    // 📅 시즌 목록 조회
    useEffect(() => {
        api.get('/seasons')
            .then(res => {
                setSeasonOptions(res.data);
                setSelectedSeasonId(res.data[0]?.id || null); // 가장 첫 시즌을 기본 선택
            })
            .catch(err => console.error('시즌 목록 로딩 실패:', err));
    }, []);

    // 📦 선택된 시즌의 주문 내역 조회
    useEffect(() => {
        if (!selectedSeasonId || !user?.id) return;

        api.get(`/orders/${selectedSeasonId}`, { withCredentials: true })
            .then(res => setOrders(res.data))
            .catch(err => {
                console.error('주문 내역 로딩 실패:', err);
                setOrders([]);
            });
    }, [selectedSeasonId, user]);

    // 🔍 필터링된 주문 내역 (타입 + 검색어)
    const filteredOrders = orders.filter(order => {
        const matchesType = !typeMap[selectedType] || order.orderType === typeMap[selectedType];
        const matchesSearch =
            searchKeyword === '' ||
            order.coinName?.includes(searchKeyword) ||
            order.symbol?.includes(searchKeyword);
        return matchesType && matchesSearch;
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)); // ✅ 최신순 정렬
    return (
        <div>
            {/* 🎛️ 필터 영역 */}
            <div className="filter-container">
                {/* 🔽 시즌 선택 드롭다운 */}
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

                {/* 🔘 주문 종류 필터 버튼 */}
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
                    {/* 📌 고정 테이블 헤더 */}
                    <div className="table-header">
                        <div className="col">코인명</div>
                        <div className="col">거래수량</div>
                        <div className="col">거래단가&nbsp;<small>(KRW)</small></div>
                        <div className="col">거래금액&nbsp;<small>(KRW)</small></div>
                        <div className="col">체결시간</div>
                        <div className="col">주문시간</div>
                    </div>

                    {/* 🔁 주문 내역 렌더링 */}
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
                                        <div className="col">{formatNumber(quantity, decimal, true)}</div>
                                        <div className="col">
                                            {unitPrice > 0 ? formatCurrency(unitPrice, unitPrice < 1000 ? 2 : 0) : '-'}
                                        </div>
                                        <div className="col">
                                            {unitPrice > 0 ? formatCurrency(totalPrice, totalPrice < 1000 ? 2 : 0) : '-'}
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
