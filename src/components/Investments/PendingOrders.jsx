import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axiosConfig';

export default function PendingOrders() {
    const [pendingOrders, setPendingOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState(new Set());

    const fetchOrders = () => {
        api.get('/trade/reserve')
            .then(res => {
                setPendingOrders(Array.isArray(res.data) ? res.data : []);
                setSelectedIds(new Set()); // 선택 초기화
            })
            .catch(err => {
                console.error('❌ 예약 주문 요청 실패:', err);
                setPendingOrders([]);
            });
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        if (filter === 'all') return pendingOrders;
        return pendingOrders.filter(order =>
            order.orderType?.toLowerCase() === filter
        );
    }, [filter, pendingOrders]);

    const toggleSelect = (orderId) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            newSet.has(orderId) ? newSet.delete(orderId) : newSet.add(orderId);
            return newSet;
        });
    };

    const formatNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? '-' : num.toLocaleString();
    };

    const formatDate = (value) => {
        return value ? new Date(value).toLocaleString() : '-';
    };

    const handleCancelSelected = () => {
        if (selectedIds.size === 0) {
            alert('선택된 주문이 없습니다.');
            return;
        }

        if (!window.confirm('선택한 주문을 모두 취소하시겠습니까?')) return;

        const cancelPromises = Array.from(selectedIds).map(id =>
            api.delete(`/trade/reserve/${id}`)
        );

        Promise.all(cancelPromises)
            .then(() => {
                alert('선택한 주문이 취소되었습니다.');
                fetchOrders();
            })
            .catch(err => {
                console.error('❌ 선택 주문 취소 실패', err);
                alert('일부 주문 취소에 실패했습니다.');
            });
    };

    return (
        <div className="holdings-list">
            {/* 상단 필터 및 버튼 영역 */}
            <div className="holdings-header">
                <div className="orders-header">
                    <select
                        className="order-select"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">전체주문</option>
                        <option value="buy">매수주문</option>
                        <option value="sell">매도주문</option>
                    </select>
                    <button className="cancel-selected-btn" onClick={handleCancelSelected}>
                        선택취소
                    </button>
                </div>
            </div>

            {/* 테이블 헤더 */}
            <div className="holdings-table">
                <div className="table-header">
                    <div className="col">코인명</div>
                    <div className="col">주문수량</div>
                    <div className="col">감시가격</div>
                    <div className="col">주문가격</div>
                    <div className="col">주문시간</div>
                    <div className="col">미체결량</div>
                </div>

                {/* 주문 리스트 */}
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((item) => (
                        <div
                            key={item.id}
                            className={`table-row ${selectedIds.has(item.id) ? 'selected' : ''}`}
                            onClick={() => toggleSelect(item.id)}
                        >
                            <div className="col coin-info">
                                {/*<div className="coin-icon">₿</div>*/}
                                <div>
                                    <div className="coin-name">{item.coin}</div>
                                    <div className="coin-symbol">{item.symbol}</div>
                                </div>
                            </div>
                            <div className="col">{formatNumber(item.quantity)} <small>{item.symbol}</small></div>
                            <div className="col">{formatNumber(item.watchPrice)} <small>KRW</small></div>
                            <div className="col">{item.tradePrice !== null ? formatNumber(item.tradePrice) : '-'}</div>
                            <div className="col">{formatDate(item.orderTime)}</div>
                            <div className="col">{formatNumber(item.remainingQuantity)} <small>{item.symbol}</small></div>
                        </div>
                    ))
                ) : (
                    <div className="table-row">
                        <div className="col">예약 주문이 없습니다.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
