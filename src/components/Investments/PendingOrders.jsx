import React, { useState, useMemo } from 'react';

export default function PendingOrders() {
    // 1️⃣ 임시로 사용할 예약 주문 데이터 (백엔드 연동 전)
    const [pendingOrders, setPendingOrders] = useState([
        {
            id: 1,
            coin: '비트코인',
            symbol: 'BTC',
            orderType: 'BUY',
            quantity: '0.05',
            watchPrice: '52,000,000',
            orderPrice: '51,800,000',
            orderTime: '2025-06-09 19:12:00',
            remainingQuantity: '0.05',
        },
        {
            id: 2,
            coin: '이더리움',
            symbol: 'ETH',
            orderType: 'SELL',
            quantity: '1.2',
            watchPrice: '4,000,000',
            orderPrice: '3,980,000',
            orderTime: '2025-06-09 19:15:00',
            remainingQuantity: '1.2',
        }
    ]);

    // 2️⃣ 필터 상태 ('all' | 'buy' | 'sell')
    const [filter, setFilter] = useState('all');

    // 3️⃣ 필터링된 예약 주문만 보여주도록 처리
    const filteredOrders = useMemo(() => {
        if (filter === 'all') return pendingOrders;
        return pendingOrders.filter(order => order.orderType.toLowerCase() === filter);
    }, [filter, pendingOrders]);

    // 4️⃣ 전체 취소 버튼 클릭 시 알림 (백엔드 연동 전이므로 임시 처리)
    const handleCancelAll = () => {
        alert('전체 주문 취소 기능은 백엔드 연동 후 동작합니다.');
        // 추후: setPendingOrders([]); 혹은 API 호출로 대체
    };

    return (
        <div className="holdings-list">
            {/* 상단 필터 영역 */}
            <div className="holdings-header">
                <div className="orders-header">
                    {/* 주문 타입 필터 select 박스 */}
                    <select
                        className="order-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">전체주문</option>
                        <option value="buy">매수주문</option>
                        <option value="sell">매도주문</option>
                    </select>
                    <button className="cancel-all-btn" onClick={handleCancelAll}>전체취소</button>
                </div>
            </div>

            {/* 예약 주문 테이블 */}
            <div className="holdings-table">
                <div className="table-header">
                    <div className="col">코인명</div>
                    <div className="col">주문수량</div>
                    <div className="col">감시가격</div>
                    <div className="col">주문가격</div>
                    <div className="col">주문시간</div>
                    <div className="col">미체결량</div>
                </div>

                {/* 주문 목록 반복 렌더링 */}
                {filteredOrders.map((item) => (
                    <div key={item.id} className="table-row">
                        <div className="col coin-info">
                            <div className="coin-icon">₿</div>
                            <div>
                                <div className="coin-name">{item.coin}</div>
                                <div className="coin-symbol">{item.symbol}</div>
                            </div>
                        </div>
                        <div className="col">{item.quantity} <small>{item.symbol}</small></div>
                        <div className="col">{item.watchPrice} <small>KRW</small></div>
                        <div className="col">{item.orderPrice} <small>KRW</small></div>
                        <div className="col">{item.orderTime}</div>
                        <div className="col">{item.remainingQuantity} <small>{item.symbol}</small></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
