export default function Sidebar() {
    return (
        <div className="sidebar-placeholder">
            <div className="sidebar-section">
                <div className="balance-info">
                    <div className="balance-item">
                        <span>원화</span>
                        <span>보유</span>
                        <span>관심</span>
                    </div>
                    <div className="balance-row">
                        <span>이름</span>
                        <span>현재가</span>
                        <span>전일대비</span>
                    </div>
                </div>
                <div className="coin-list">
                    <div className="coin-item">
                        <div>도지코인</div>
                        <div>317.3</div>
                        <div className="negative">-2.70%</div>
                    </div>
                    <div className="coin-item">
                        <div>비트코인</div>
                        <div>145,387,000</div>
                        <div className="positive">+0.35%</div>
                    </div>
                </div>
            </div>
        </div>
    );
};