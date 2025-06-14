import React, {useEffect, useRef, useState} from 'react';
import '../../styles/trade/OrderBox.css';
import api from '../../api/axiosConfig.js';
import {useToast} from "../Toast.jsx";

export default function OrderBox({selectedMarket, tickerMap, onOrderPlaced, cash, holdings}) {
    const [tradeTab, setTradeTab] = useState('BUY');
    const [amount, setAmount] = useState('');
    const [orderType, setOrderType] = useState('BUY');
    const [tradeType, setTradeType] = useState('market');
    const [price, setPrice] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const currentPrice = tickerMap[selectedMarket]?.price ?? 0;

    const formattedHolding = holdings.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 20
    });
    const currency = selectedMarket.split("-")[0];
    const displaySymbol = selectedMarket.split('-')[1];
    const { infoAlert, errorAlert } = useToast();

    useEffect(() => {
        if (tradeType === 'reserve' && price === '') {
            setPrice(formatNumber(currentPrice));
        }
    }, [tradeType]);

    useEffect(() => {
        if (tradeType === 'reserve') {
            const rawPrice = parseFloat(price.replace(/,/g, ''));
            const rawAmount = parseFloat(amount.replace(/,/g, ''));
            if (isNaN(rawPrice) || isNaN(rawAmount)) {
                setTotalPrice('');
                return;
            }

            const rawTotal = rawPrice * rawAmount;
            const total = orderType === 'BUY'
                ? Math.ceil(rawTotal)  // 매수는 올림
                : Math.floor(rawTotal); // 매도는 내림

            setTotalPrice(total.toLocaleString());
        }
    }, [price, amount, tradeType, orderType]);

    useEffect(() => {
        setPrice(formatNumber(currentPrice))
        setAmount('');
        setTotalPrice('');
    }, [tradeTab, tradeType]);

    useEffect(() => {
        setTradeTab('BUY');
        setOrderType('BUY');
        setTradeType('market');
        setTotalPrice('');
    }, [selectedMarket]);

    const formatNumber = (value) => {
        const raw = typeof value === 'number' ? value : parseFloat(value.toString().replace(/,/g, ''));
        if (isNaN(raw)) return '';
        if (Number.isInteger(raw)) return raw.toLocaleString();
        let str = raw.toLocaleString('en-US', {maximumFractionDigits: 20});
        return str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    };

    const handlePriceChange = (e) => {
        const input = e.target;
        const raw = input.value.replace(/,/g, '');

        if (!/^[0-9]*\.?[0-9]*$/.test(raw)) return;

        const prevLength = input.value.length;
        const cursorPos = input.selectionStart;

        const formatted = formatNumber(raw);

        setPrice(formatted);

        requestAnimationFrame(() => {
            const inputEl = inputRef.current;
            if (inputEl) {
                const nextLength = formatted.length;
                const diff = nextLength - prevLength;
                inputEl.setSelectionRange(cursorPos + diff, cursorPos + diff);
            }
        });
    };

    const handleTotalPriceChange = (e) => {
        const raw = e.target.value.replace(/,/g, '');
        if (!/^\d*$/.test(raw)) return;

        const intVal = parseInt(raw, 10);
        if (isNaN(intVal)) {
            setTotalPrice('');
        } else {
            setTotalPrice(intVal.toLocaleString());
        }
    };


    const handleAmountChange = (e) => {
        const raw = e.target.value.replace(/,/g, '');
        if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
            if (raw.endsWith('.') || (raw.includes('.') && /\.\d*0+$/.test(raw))) {
                setAmount(raw);
            } else {
                setAmount(formatNumber(raw));
            }
        }
    };

    const handlePercentClick = (percent) => {
        if (tradeTab === 'BUY') {
            const budget = cash * percent;
            setTotalPrice(formatNumber(tradeType === 'BUY' ? Math.ceil(budget) : Math.floor(budget)));
            if (tradeType === 'market') {
                const qty = currentPrice > 0 ? budget / currentPrice : 0;
                setAmount(formatNumber(qty));
            } else {
                const reservePrice = parseFloat(price.replace(/,/g, ''));
                const qty = reservePrice > 0 ? budget / reservePrice: 0;
                setAmount(formatNumber(qty));
            }
        } else if (tradeTab === 'SELL') {
            const qty = holdings * percent;
            setAmount(formatNumber(qty));
        }
    };

    const handlePlaceOrder = async () => {
        const rawAmount = parseFloat(amount.replace(/,/g, ''));
        const rawPrice = parseFloat(price.replace(/,/g, ''));
        const rawTotalPrice = parseFloat(totalPrice.toString().replace(/,/g, ''));

        setLoading(true);
        try {
            const isBuy = orderType === 'BUY';
            const isReserve = tradeType === 'reserve';

            if (isReserve) {
                if (isNaN(rawAmount) || rawAmount <= 0) {
                    return errorAlert('예약 주문 수량을 입력해주세요.');
                }
                if (isNaN(rawPrice) || rawPrice <= 0) {
                    return errorAlert('예약 가격을 입력해주세요.');
                }
            } else {
                if (isBuy) {
                    if (isNaN(rawTotalPrice) || rawTotalPrice <= 0) {
                        return errorAlert('주문 총액을 입력해주세요.');
                    }
                    if (cash < rawTotalPrice) {
                        return errorAlert('잔액이 부족합니다.');
                    }
                } else {
                    if (isNaN(rawAmount) || rawAmount <= 0) {
                        return errorAlert('매도 수량을 입력해주세요.');
                    }
                }
            }

            const payload = {
                symbol: selectedMarket,
                orderType,
                ...(isReserve
                    ? {
                        amount: rawAmount,
                        reservePrice: rawPrice
                    }
                    : isBuy
                        ? { totalPrice: rawTotalPrice }
                        : { amount: rawAmount })
            };

            const url = isReserve ? '/trade/reserve' : '/trade';
            const response = await api.post(url, payload);

            if (!isReserve) {
                if (isBuy) {
                    infoAlert(`${response.data.amount}개 매수 주문이 체결되었습니다.`);
                } else {
                    const total = Math.floor(response.data.tradePrice * response.data.amount);
                    infoAlert(`${formatNumber(total)} ${currency}에 매도 주문이 체결되었습니다.`);
                }
            } else {
                infoAlert('예약 주문이 접수되었습니다.');
            }

            onOrderPlaced?.(response.data);
            setAmount('');
            setTotalPrice('');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.';
            errorAlert(`주문 실패: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="trade-form-wrapper">
            <div className="trade-tabs">
                <div className="trade-sellbuy-tab">
                    <span className={tradeTab === 'BUY' ? 'active' : ''} onClick={() => { setTradeTab('BUY'); setOrderType('BUY'); }}>매수</span>
                    <span className={tradeTab === 'SELL' ? 'active' : ''} onClick={() => { setTradeTab('SELL'); setOrderType('SELL'); }}>매도</span>
                </div>
            </div>

            <div className="order-radio-section">
                <div className="order-label">주문유형</div>
                <div className="radio-group">
                    <label>
                        <input type="radio" name="tradeType" value="market" checked={tradeType === 'market'} onChange={(e) => setTradeType(e.target.value)} /> 시장가
                    </label>
                    <label>
                        <input type="radio" name="tradeType" value="reserve" checked={tradeType === 'reserve'} onChange={(e) => setTradeType(e.target.value)} /> 예약주문
                    </label>
                </div>
            </div>

            <div className={tradeTab === 'BUY' ? 'buy-form' : 'sell-form'}>
                <div className="buy-section">
                    <div className="label">주문가능</div>
                    <input className="buy-money" type="text" value={tradeTab === 'BUY' ? `${cash.toLocaleString()} ${currency}` : `${formattedHolding} ${displaySymbol}`} readOnly />
                </div>

                {tradeType === 'reserve' && (
                    <div className="buy-section">
                        <div className="label">{tradeTab === 'BUY' ? '매수가격' : '매도가격'} <span>({currency})</span></div>
                        <input
                            className={"buy-price-insert"}
                            ref={inputRef}
                            value={price}
                            onChange={handlePriceChange}
                        />
                    </div>
                )}

                <div className="percent-buttons">
                    {[0.1, 0.25, 0.5, 1].map((p, i) => (
                        <button key={i} type="button" onClick={() => handlePercentClick(p)}>{p * 100}%</button>
                    ))}
                </div>

                {(tradeTab === 'SELL' || tradeType === 'reserve') && (
                    <div className="buy-section">
                        <div className="label">주문수량 <span>({displaySymbol})</span></div>
                        <div className="buy-count">
                            <input className="buy-count-insert" type="text" value={amount} onChange={handleAmountChange} readOnly={tradeTab === 'BUY' && tradeType === 'market'} />
                        </div>
                    </div>
                )}

                {(tradeTab === 'BUY' || tradeType === 'reserve') && (
                    <div className="buy-section">
                        <div className="label">주문총액 <span>({currency})</span></div>
                        <input
                            className="buy-total-cost"
                            type="text"
                            value={totalPrice}
                            onChange={handleTotalPriceChange}
                            readOnly={(!(tradeTab === 'BUY' && tradeType === 'market'))}
                        />
                    </div>
                )}

                <button className={tradeTab === 'BUY' ? 'buy-btn' : 'sell-btn'} onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? '주문 처리 중…' : tradeTab === 'BUY' ? '매수' : '매도'}
                </button>
            </div>
        </div>
    );
}
