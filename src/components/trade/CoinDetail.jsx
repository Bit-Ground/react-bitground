import React, { useEffect, useState, useRef } from 'react';

const CoinDetail = ({ market, data }) => {
    if (!market) {
        return <div className="coin-detail">코인을 선택해주세요</div>;
    }

    const { price, changeAmt, changeRate, volume } = data || {};
    return (
        <div className="coin-detail">
            <h2>{market} 상세</h2>
            <p>현재가: { price != null ? price.toLocaleString() : '—' }</p>
            <p>전일대비: { changeAmt != null ? changeAmt.toLocaleString() : '—' }</p>
            <p>변동률: { changeRate != null ? (changeRate*100).toFixed(2)+'%' : '—' }</p>
            <p>24h 거래대금: { volume != null ? volume.toLocaleString() : '—' }</p>
            {/* 여기에 차트, 호가창, 체결 내역 위젯 등 추가 */}
        </div>
    );
};

export default CoinDetail;
