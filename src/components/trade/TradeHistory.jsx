import React from 'react';

export default function TradeHistory() {
    return (
        <table className="trade-history__table">
            <thead>
            <tr>
                <th>시간</th>
                <th>체결가(KRW)</th>
                <th>체결량(BTC)</th>
            </tr>
            </thead>
            <tbody>
            {/* map으로 내역 렌더링 */}
            <tr>
                <td>05.13 16:27:53</td>
                <td>145,296,000</td>
                <td>0.00382047</td>
            </tr>
            </tbody>
        </table>
    );
}