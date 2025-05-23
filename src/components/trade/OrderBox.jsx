import React, { useState } from 'react';

export default function OrderBox() {
    const [amount, setAmount] = useState('');
    return (
        <form className="order-box__form">
            <h3>매수 / 매도</h3>
            <div>
                <label>수량</label>
                <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
            </div>
            <button type="submit">구매하기</button>
        </form>
    );
}