import React, { useState } from 'react';
import './Mypage.css';

export default function Mypage() {
    const [selectedMenu, setSelectedMenu] = useState('invest-info'); // 기본값 설정

    return (
        <div className={"mypage"}>
            <div className="mypage-container">
                <div className={"mypage-title"}>
                    * 마이페이지
                </div>
                <div className={"mypage-content"}>
                    <div className={"mypage-list"}>
                        <div className={`invest-info ${selectedMenu === 'invest-info' ? 'active' : ''}`}
                             onClick={() => setSelectedMenu('invest-info')}>
                            투자 정보
                        </div>
                        <div className={`my-info ${selectedMenu === 'my-info' ? 'active' : ''}`}
                             onClick={() => setSelectedMenu('my-info')}>
                            개인정보 수정
                        </div>
                        <div className={`invest-last ${selectedMenu === 'invest-last' ? 'active' : ''}`}
                             onClick={() => setSelectedMenu('invest-last')}>
                            지난시즌 내역
                        </div>
                    </div>

                    <div className={"content-list"}>
                        {selectedMenu === 'invest-info' && (
                            <div>📊 투자 정보 내용</div>
                        )}
                        {selectedMenu === 'my-info' && (
                            <div>
                                <h3>개인정보 수정</h3>
                                <label>이름: <input type="text" placeholder="홍길동" /></label><br/>
                                <label>이메일: <input type="email" placeholder="example@email.com" /></label><br/>
                                <button>수정하기</button>
                            </div>
                        )}
                        {selectedMenu === 'invest-last' && (
                            <div>📅 지난 시즌 내역</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}