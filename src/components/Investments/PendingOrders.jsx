import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useToast } from "../Toast.jsx"; // 알림 토스트 훅
import api from '../../api/axiosConfig'; // Axios 설정 import

export default function PendingOrders() {
    // ✅ 알림 함수 (info, error)
    const { infoAlert, errorAlert } = useToast();

    // ✅ 상태값 정의
    const [pendingOrders, setPendingOrders] = useState([]); // 전체 예약 주문 목록
    const [filter, setFilter] = useState('all'); // 필터 상태 (all, buy, sell)
    const [selectedIds, setSelectedIds] = useState([]); // 선택된 주문 ID 목록

    // ✅ 수정 모드 관련 상태
    const [editOrderId, setEditOrderId] = useState(null); // 현재 수정 중인 주문 ID
    const [editPrice, setEditPrice] = useState(''); // 수정할 주문 가격
    const inputRef = useRef(null); // input 외부 클릭 감지를 위한 ref

    // ✅ 예약 주문 목록 불러오기
    const fetchOrders = () => {
        api.get('/orders/reserve')
            .then(res => {
                console.log('✅ 예약 주문 목록:', res.data);
                setPendingOrders(Array.isArray(res.data) ? res.data : []);
                setSelectedIds([]); // 선택 초기화
            })
            .catch(err => {
                console.error('❌ 예약 주문 요청 실패:', err);
                setPendingOrders([]);
            });
    };

    // ✅ 컴포넌트 마운트 시 주문 불러오기
    useEffect(() => {
        fetchOrders();
    }, []);

    // ✅ 필터링된 주문 목록 계산 (메모이제이션)
    const filteredOrders = useMemo(() => {
        if (filter === 'all') return pendingOrders;
        return pendingOrders.filter(order =>
            order.orderType?.toLowerCase() === filter
        );
    }, [filter, pendingOrders]);

    // ✅ 선택 상태 토글
    const toggleSelect = (orderId) => {
        setSelectedIds(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    // ✅ 숫자 포맷 함수
    const formatNumber = (value) => {
        const num = Number(value);
        return isNaN(num) ? '-' : num.toLocaleString();
    };

    // ✅ 날짜 포맷 함수
    const formatDate = (value) => {
        if (!value) return '-';
        const date = new Date(value);
        const yy = String(date.getFullYear());
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${yy}-${mm}-${dd} ${hh}:${min}`;
    };

    // ✅ 선택된 주문 일괄 취소
    const handleCancelSelected = () => {
        if (selectedIds.length === 0) {
            errorAlert('선택된 주문이 없습니다.');
            return;
        }
        if (!window.confirm('선택한 주문을 모두 취소하시겠습니까?')) return;

        Promise.all(selectedIds.map(id => api.delete(`/orders/${id}`)))
            .then(() => {
                infoAlert('선택한 주문이 취소되었습니다.');
                fetchOrders();
            })
            .catch(err => {
                console.error('❌ 주문 취소 실패', err);
                errorAlert('주문 취소에 실패했습니다.');
            });
    };

    // ✅ 주문가격 수정 처리
    const handleEditSubmit = (orderId) => {
        const price = parseFloat(editPrice);
        if (isNaN(price) || price <= 0) {
            errorAlert('유효한 가격을 입력해주세요.');
            return;
        }

        api.patch(`/orders/${orderId}`, { reservePrice: price })
            .then(() => {
                infoAlert('주문가격이 수정되었습니다.');
                setEditOrderId(null);  // 수정 모드 종료
                setEditPrice('');
                fetchOrders();
            })
            .catch(err => {
                console.error('❌ 주문가격 수정 실패:', err);
                errorAlert('수정에 실패했습니다.');
            });
    };

    // ✅ 외부 클릭 시 수정모드 종료
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (editOrderId !== null && inputRef.current && !inputRef.current.contains(e.target)) {
                setEditOrderId(null);
                setEditPrice('');
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [editOrderId]);

    // ✅ 컴포넌트 렌더링
    return (
        <div className="holdings-list">
            {/* ───────── 상단 필터 및 버튼 영역 ───────── */}
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
                        거래취소
                    </button>
                </div>
            </div>

            {/* ───────── 주문 테이블 ───────── */}
            <div className="holdings-table">
                {/* ───── 테이블 헤더 ───── */}
                <div className="table-header">
                    <div className="col">코인명</div>
                    <div className="col">주문수량</div>
                    <div className="col">감시가격&nbsp;<small>KRW</small></div>
                    <div className="col">주문가격&nbsp;<small>KRW</small></div>
                    <div className="col">주문시간</div>
                    <div className="col align-right">미체결량</div>
                </div>

                {/* ───── 테이블 바디 ───── */}
                {filteredOrders.length > 0 ? (
                    filteredOrders.map((item, index) => {
                        const isSelected = selectedIds.includes(item.id);
                        const isEditing = editOrderId === item.id;

                        return (
                            <div
                                key={`${item.id}-${index}`}
                                className={`table-row ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleSelect(item.id)}
                            >
                                {/* 코인명 */}
                                <div className="col coin-info">
                                    <div>
                                        <div className="coin-name">{item.koreanName}</div>
                                        <div className="coin-symbol">{item.symbol}</div>
                                    </div>
                                </div>

                                {/* 주문수량 */}
                                <div className="col">
                                    {formatNumber(item.amount)} <small>{item.symbol}</small>
                                </div>

                                {/* 감시가격 */}
                                <div className="col">{formatNumber(item.reservePrice)}</div>

                                {/* 주문가격 (수정 가능) */}
                                <div className="col">
                                    {isEditing ? (
                                        <div
                                            ref={inputRef}
                                            className="edit-area"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <input
                                                type="number"
                                                className="edit-input"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(e.target.value)}
                                            />
                                            <button
                                                className="edit-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditSubmit(item.id);
                                                }}
                                            >
                                                수정
                                            </button>
                                        </div>
                                    ) : (
                                        <span
                                            className="editable-price"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditOrderId(item.id);
                                                setEditPrice(item.reservePrice);
                                            }}
                                        >
                                            {formatNumber(item.reservePrice)}
                                        </span>
                                    )}
                                </div>

                                {/* 주문시간 */}
                                <div className="col">{formatDate(item.createdAt)}</div>

                                {/* 미체결량 */}
                                <div className="col align-right">
                                    {formatNumber(item.amount)} <small>{item.symbol}</small>
                                </div>
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
