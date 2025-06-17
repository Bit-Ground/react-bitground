import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from "../Toast.jsx";
import api from '../../api/axiosConfig';

export default function PendingOrders() {
    const { infoAlert, errorAlert } = useToast();
    const [pendingOrders, setPendingOrders] = useState([]);
    const [filter, setFilter] = useState('all');
    const [selectedIds, setSelectedIds] = useState(new Set());

    const fetchOrders = () => {
        api.get('/orders/reserve')
            .then(res => {
                setPendingOrders(Array.isArray(res.data) ? res.data : []);
                setSelectedIds(new Set());
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
                    <button className="cancel-selected-btn">
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
                    filteredOrders.map((item) => (
                        <div
                            key={item.id}
                            className={`table-row ${selectedIds.has(item.id) ? 'selected' : ''}`}
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
