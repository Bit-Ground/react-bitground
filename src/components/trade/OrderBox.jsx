import React, {useEffect, useState} from 'react';
import '../../styles/trade/OrderBox.css';
import api from '../../api/axiosConfig.js';
import {useToast} from "../Toast.jsx";

export default function OrderBox({selectedMarket, tickerMap, onOrderPlaced, cash, holdings}) {
    const [tradeTab, setTradeTab] = useState('BUY');
    const [amount, setAmount] = useState('');
    const [orderType, setOrderType] = useState('BUY');
    const [tradeType, setTradeType] = useState('market');
    const [price, setPrice] = useState('');
    const [fixedPrice, setFixedPrice] = useState('');
    const [loading, setLoading] = useState(false);

    const currentPrice = tickerMap[selectedMarket]?.price ?? 0;
    const maxBuyQty = currentPrice > 0 ? Math.floor((cash / currentPrice) * 10000) / 10000 : 0;

    const formattedHolding = holdings.toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 8
    });
    const displaySymbol = selectedMarket.split('-')[1];
    const { infoAlert, errorAlert } = useToast();

    useEffect(() => {
        if (tradeType === 'reserve') {
            setPrice(formatNumber(currentPrice));
            setFixedPrice(price*amount);
        } else if (tradeType === 'market') {
            setPrice(formatNumber(currentPrice));
        }
    }, [currentPrice, tradeType]);

    useEffect(() => {
        setAmount('');
        setPrice(tradeType === 'reserve' ? formatNumber(currentPrice) : '');
        setFixedPrice('');
    }, [tradeTab, tradeType]);

    useEffect(() => {
        setTradeTab('BUY');
        setOrderType('BUY');
        setTradeType('market');
        setFixedPrice('');
    }, [selectedMarket]);

    const formatNumber = (value) => {
        const raw = typeof value === 'number' ? value : parseFloat(value.toString().replace(/,/g, ''));
        if (isNaN(raw)) return '';
        if (Number.isInteger(raw)) return raw.toLocaleString();
        let str = raw.toLocaleString('en-US', {maximumFractionDigits: 8});
        return str.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
    };

    const handlePriceChange = (e) => {
        const raw = e.target.value.replace(/,/g, '');
        if (/^[0-9]*\.?[0-9]*$/.test(raw)) {
            if (raw.endsWith('.') || (raw.includes('.') && /\.\d*0+$/.test(raw))) {
                setFixedPrice(raw);
            } else {
                setFixedPrice(formatNumber(raw));
            }
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
            const budget = Math.floor(cash * percent);
            setFixedPrice(formatNumber(budget));
            if (tradeType === 'market') {
                const qty = currentPrice > 0 ? Math.floor((budget / currentPrice) * 10000) / 10000 : 0;
                setAmount(formatNumber(qty));
            } else {
                const reservePrice = parseFloat(price.replace(/,/g, ''));
                const qty = reservePrice > 0 ? Math.floor((budget / reservePrice) * 10000) / 10000 : 0;
                setAmount(formatNumber(qty));
            }
        } else if (tradeTab === 'SELL') {
            const qty = Math.floor(holdings * percent * 10000) / 10000;
            setAmount(formatNumber(qty));
        }
    };

    const handlePlaceOrder = async () => {
        const rawAmount = parseFloat(amount.replace(/,/g, ''));
        const rawPrice = parseFloat(price.replace(/,/g, ''));
        const rawFixedPrice = parseFloat(fixedPrice.toString().replace(/,/g, ''));

        setLoading(true);
        try {
            const payload = {
                symbol: selectedMarket,
                orderType,
                amount: rawAmount,
                reservePrice: tradeType === 'reserve' ? rawPrice : null,
            };
            const response = await api.post('/api/trade', payload);
            if (isNaN(rawAmount) || rawAmount <= 0) {
                return errorAlert('주문 수량을 올바르게 입력해주세요.');
            }

            if (orderType === 'BUY' && tradeType === 'market') {
                if (cash < rawFixedPrice) return errorAlert('잔액이 부족합니다.');
                const qty = currentPrice > 0 ? Math.floor((rawFixedPrice / currentPrice) * 10000) / 10000 : 0;
                infoAlert(`${response.data.amount}개 매수 주문이 체결되었습니다.`);
            }

            if (orderType === 'SELL' && tradeType === 'market') {
                const total = response.data.tradePrice * response.data.amount;
                infoAlert(`${formatNumber(total)} KRW에 매도 주문이 체결되었습니다.`);
            }

            if (orderType === 'BUY' && rawAmount > maxBuyQty) {
                return errorAlert(`최대 ${formatNumber(maxBuyQty)}개까지 주문 가능합니다.`);
            }
            if (tradeType === 'reserve') {
                infoAlert("예약 주문이 접수되었습니다.");
            } else {
                onOrderPlaced?.(response.data);
            }
            setAmount('');
            setFixedPrice('');
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
                    <input className="buy-money" type="text" value={tradeTab === 'BUY' ? `${cash.toLocaleString()} KRW` : `${formattedHolding} ${displaySymbol}`} readOnly />
                </div>

                {tradeType === 'reserve' && (
                    <div className="buy-section">
                        <div className="label">{tradeTab === 'BUY' ? '매수가격' : '매도가격'} <span>(KRW)</span></div>
                        <input className="buy-price-insert" type="text" value={price} onChange={handlePriceChange} />
                    </div>
                )}

                <div className="percent-buttons">
                    {[0.1, 0.25, 0.5, 1].map((p, i) => (
                        <button key={i} type="button" onClick={() => handlePercentClick(p)}>{p * 100}%</button>
                    ))}
                </div>

                {(tradeTab === 'SELL' || tradeType === 'reserve') && (
                    <div className="buy-section">
                        <div className="label">주문수량</div>
                        <div className="buy-count">
                            <input className="buy-count-insert" type="text" value={amount} onChange={handleAmountChange} readOnly={tradeTab === 'BUY' && tradeType === 'market'} />
                        </div>
                    </div>
                )}

                {tradeTab === 'BUY' && (
                    <div className="buy-section">
                        <div className="label">주문총액 <span>(KRW)</span></div>
                        <input
                            className="buy-total-cost"
                            type="text"
                            value={fixedPrice}
                            onChange={handlePriceChange}
                            readOnly={false}
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
