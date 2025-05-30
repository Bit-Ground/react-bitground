import React, {useState} from 'react';
import '../../styles/trade/OrderBox.css'

export default function OrderBox() {
    const [tradeTab, setTradeTab] = useState('buy'); // 'buy' | 'sell' | 'history'
    const [orderType, setOrderType] = useState('market');
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');

    return (
        <div className="trade-form-wrapper">
            {/* 상단 탭 */}
            <div className="trade-tabs">
                <div className="trade-sellbuy-tab">
                <span
                    className={tradeTab === 'buy' ? 'active' : ''}
                    onClick={() => setTradeTab('buy')}>
                    매수
                </span>
                    <span
                        className={tradeTab === 'sell' ? 'active' : ''}
                        onClick={() => setTradeTab('sell')}>
                    매도
                </span>
                </div>
                <span
                    className={tradeTab === 'history' ? 'active' : ''}
                    onClick={() => setTradeTab('history')}>
                    거래내역
                </span>
            </div>

            {/* 탭별 콘텐츠 렌더링 */}

            {tradeTab === 'buy' && (
                <div className="buy-form">
                    {/* 매수 폼 */}
                    <div className="order-radio-section">
                        <div className="order-label">주문유형</div>
                        <div className="radio-group">
                            <label>
                                <input
                                    type="radio"
                                    name="orderType"
                                    value="market"
                                    checked={orderType === 'market'}
                                    onChange={(e) => setOrderType(e.target.value)}
                                />&nbsp;
                                시장가격
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    name="orderType"
                                    value="reserve"
                                    checked={orderType === 'reserve'}
                                    onChange={(e) => setOrderType(e.target.value)}
                                />&nbsp;
                                예약가격
                            </label>
                        </div>
                    </div>
                    <div className="buy-section">
                        <div className="label">주문가능</div>
                        <input className={"buy-money"} type="text" value={'0'} readOnly/>
                    </div>

                    <div className="buy-section">
                        <div className="label">매수가격<span> (KRW)</span></div>
                        <input className={"buy-price-insert"} type="number"
                               value={price} onChange={(e) => setPrice(e.target.value)}/>
                    </div>

                    <div className="buy-section">
                            <div className="label">주문수량</div>
                        <div className="buy-count">
                            <input className={"buy-count-insert"} type="number"
                                   value={quantity} onChange={(e) => setQuantity(e.target.value)}/>
                            <div className="percent-buttons">
                                <button>10%</button>
                                <button>25%</button>
                                <button>50%</button>
                                <button>100%</button>
                                <button>직접입력</button>
                            </div>
                        </div>
                    </div>

                    <div className="buy-section">
                        <div className="label">주문총액 <span>(KRW)</span></div>
                        <input className={"buy-total-cost"} type="text" value={''} readOnly/>
                    </div>

                    <button className="sell-btn">구매하기</button>
                </div>
            )}

            {tradeTab === 'sell' && (
                <div className="sell-form">
                    <p>🛒 여기에 매도 UI 구성</p>
                </div>
            )}

            {tradeTab === 'history' && (
                <div className="history-section">
                    <p>📜 거래 내역 표시</p>
                </div>
            )}
        </div>
    );
}