import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from "../Toast.jsx";
import api from '../../api/axiosConfig';

export default function PendingOrders() {
    const { infoAlert, errorAlert } = useToast();
    const [pendingOrders, setPendingOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState([]);

    const fetchOrders = () => {
        api.get('/orders/reserve')
            .then(res => {
                console.log('✅ 예약 주문 목록:', res.data);
                setPendingOrders(Array.isArray(res.data) ? res.data : []);
                setSelectedIds([]); // 초기화
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
        setSelectedIds(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId) // 해제
                : [...prev, orderId] // 추가
        );
    };

    const formatNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? '-' : num.toLocaleString();
    };

    const formatDate = (value) => {
        return value ? new Date(value).toLocaleString() : '-';
    };

    const handleCancelSelected = () => {
        if (selectedIds.length === 0) {
            errorAlert('선택된 주문이 없습니다.');
            return;
        }

        if (!window.confirm('선택한 주문을 모두 취소하시겠습니까?')) return;

        Promise.all(
            selectedIds.map(id => api.delete(`/trade/reserve/${id}`))
        )
            .then(() => {
                infoAlert('선택한 주문이 취소되었습니다.');
                fetchOrders();
            })
            .catch(err => {
                console.error('❌ 주문 취소 실패', err);
                errorAlert('주문 취소에 실패했습니다.');
            });
    };

    return (
        <div className="holdings-list">
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

            <div className="holdings-table">
                <div className="table-header">
                    <div className="col">코인명</div>
                    <div className="col">주문수량</div>
                    <div className="col">감시가격</div>
                    <div className="col">주문가격</div>
                    <div className="col">주문시간</div>
                    <div className="col">미체결량</div>
                </div>

                {filteredOrders.length > 0 ? (
                    filteredOrders.map((item, index) => {
                        const isSelected = selectedIds.includes(item.id);

                        return (
                            <div
                                key={`${item.id}-${index}`}
                                className={`table-row ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleSelect(item.id)}
                            >
                                <div className="col coin-info">
                                    <div>
                                        <div className="coin-name">{item.koreanName}</div>
                                        <div className="coin-symbol">{item.symbol}</div>
                                    </div>
                                </div>
                                <div className="col">{formatNumber(item.amount)} <small>{item.symbol}</small></div>
                                <div className="col">{formatNumber(item.reservePrice)} <small>KRW</small></div>
                                <div className="col">{formatNumber(item.reservePrice)} <small>KRW</small></div>
                                <div className="col">{formatDate(item.createdAt)}</div>
                                <div className="col">{formatNumber(item.amount)} <small>{item.symbol}</small></div>
                            </div>
                        );
                    })
                ) : (
                    <div className="table-row">
                        <div className="col">예약 주문이 없습니다.</div>
                    </div>
                )}
            </div>
        </div>
    );
}
