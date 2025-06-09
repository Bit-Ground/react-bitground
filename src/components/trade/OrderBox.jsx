import React, { useContext, useEffect, useState } from 'react';
import '../../styles/trade/OrderBox.css';
import { AuthContext } from '../../auth/AuthContext.js';
import api from '../../api/axiosConfig.js';

export default function OrderBox({ selectedMarket, tickerMap, onOrderPlaced }) {
    const { user } = useContext(AuthContext);
    const [tradeTab, setTradeTab] = useState('BUY');
    const [amount, setAmount] = useState('');
    const [orderType, setOrderType] = useState('BUY');
    const [tradeType, setTradeType] = useState('market');
    const [price, setPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const currentPrice = tickerMap[selectedMarket]?.price ?? 0;
    const cash = user?.cash ?? 0;
    const maxBuyQty = currentPrice > 0
        ? Math.floor((cash / currentPrice) * 10000) / 10000
        : 0;

    // 시장가 주문이면 틱마다 가격 업데이트
    useEffect(() => {
        if (tradeType === 'market' && currentPrice) {
            setPrice(formatNumber(currentPrice));
        }
    }, [currentPrice, tradeType]);

    const formatNumber = (value) => {
        const raw = typeof value === 'number'
            ? value
            : parseFloat(value.toString().replace(/,/g, ''));
        if (isNaN(raw)) return '';
        if (Number.isInteger(raw)) {
            return raw.toLocaleString();
        }
        let str = raw.toLocaleString('en-US', { maximumFractionDigits: 8 });
        str = str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
        return str;
    };

    // 가격 입력: comma 허용, 소수점 끝 자유롭게
    const handlePriceChange = (e) => {
        const raw = e.target.value.replace(/,/g, '');
        if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
            if (raw.endsWith('.') || (raw.includes('.') && /\.\d*0+$/.test(raw))) {
                setPrice(raw);
            } else {
                setPrice(formatNumber(raw));
            }
        }
    };

    // 수량 입력: comma 허용, 소수점 끝 자유롭게, trailing zeros 보존
    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/,/g, '');
        if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
            if (
                raw.endsWith('.') ||
                (raw.includes('.') && /\.\d*0+$/.test(raw))
            ) {
                setAmount(raw);
            } else {
                setAmount(formatNumber(raw));
            }
        }
    };

    const handlePercentClick = (percent) => {
        if (tradeTab !== 'BUY' || currentPrice <= 0) return;
        const qty = (cash * percent) / currentPrice;
        const rounded = Math.floor(qty * 10000) / 10000;
        setAmount(formatNumber(rounded));
    };

    const handlePlaceOrder = async () => {
        const rawAmount = parseFloat(amount.replace(/,/g, ''));
        const rawPrice = parseFloat(price.replace(/,/g, ''));
        if (isNaN(rawAmount) || rawAmount < 0) {
            return alert('주문 수량을 올바르게 입력하세요.');
        }
        if (orderType === 'BUY' && rawAmount > maxBuyQty) {
            return alert(`최대 ${formatNumber(maxBuyQty)}개까지 주문 가능합니다.`);
        }

        setLoading(true);
        try {
            const payload = {
                symbol: selectedMarket,
                orderType,
                amount: rawAmount,
                reservePrice: tradeType === 'reserve' && rawPrice > 0 ? rawPrice : null,
            };
            const response = await api.post('/api/trade', payload);
            alert('주문이 정상 접수되었습니다.');
            onOrderPlaced?.(response.data);
            setAmount('');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.';
            alert(`주문 실패: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trade-form-wrapper">
            <div className="trade-tabs">
                <div className="trade-sellbuy-tab">
                    <span className={tradeTab === 'BUY' ? 'active' : ''} onClick={() => setTradeTab('BUY')}>매수</span>
                    <span className={tradeTab === 'SELL' ? 'active' : ''} onClick={() => setTradeTab('SELL')}>매도</span>
                </div>
                <span className={tradeTab === 'HISTORY' ? 'active' : ''} onClick={() => setTradeTab('HISTORY')}>거래내역</span>
            </div>

            {tradeTab === 'BUY' && (
                <div className="buy-form">
                    <div className="order-radio-section">
                        <div className="order-label">주문유형</div>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="tradeType"
                                    value="market"
                                    checked={tradeType === 'market'}
                                    onChange={(e) => setTradeType(e.target.value)}
                                /> 시장가격
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="tradeType"
                                    value="reserve"
                                    checked={tradeType === 'reserve'}
                                    onChange={(e) => setTradeType(e.target.value)}
                                /> 예약가격
                            </label>
                        </div>
                    </div>

                    <div className="buy-section">
                        <div className="label">주문가능</div>
                        <input className="buy-money" type="text" value={`${cash.toLocaleString()} KRW`} readOnly />
                    </div>

                    <div className="buy-section">
                        <div className="label">매수가격 <span>(KRW)</span></div>
                        <input
                            className="buy-price-insert"
                            type="text"
                            value={price}
                            onChange={handlePriceChange}
                            readOnly={tradeType === 'market'}
                        />
                    </div>

                    <div className="buy-section">
                        <div className="label">주문수량</div>
                        <div className="buy-count">
                            <input
                                className="buy-count-insert"
                                type="text"
                                value={amount}
                                onChange={handleAmountChange}
                            />
                            <div className="percent-buttons">
                                {[0.1, 0.25, 0.5, 1].map((p, i) => (
                                    <button key={i} type="button" onClick={() => handlePercentClick(p)}>{p * 100}%</button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="buy-section">
                        <div className="label">주문총액 <span>(KRW)</span></div>
                        <input
                            className="buy-total-cost"
                            type="text"
                            value={
                                currentPrice && amount
                                    ? formatNumber((parseFloat(amount.replace(/,/g, '')) || 0) * currentPrice)
                                    : ''
                            }
                            readOnly
                        />
                    </div>

                    <button
                        className="sell-btn"
                        onClick={handlePlaceOrder}
                        disabled={loading}
                    >
                        {loading ? '주문 처리 중…' : '매수'}
                    </button>
                </div>
            )}

            {tradeTab === 'SELL' && (
                <div className="sell-form"><p>🛒 여기에 매도 UI 구성</p></div>
            )}

            {tradeTab === 'HISTORY' && (
                <div className="history-section"><p>📜 거래 내역 표시</p></div>
            )}
        </div>
    );
}
