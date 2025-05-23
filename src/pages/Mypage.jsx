import React from 'react';
import './Mypage.css';

export default function Mypage() {

    return (
        <div className="mypage-container">
            <div className={"mypage-title"}>
                * 마이페이지
            </div>
            <div className={"mypage-content"}>
                <div className={"mypage-list"}>
                    <div className={"invest-info"}>
                        투자정보
                    </div>
                    <div className={"my-info"}>
                        개인정보 수정
                    </div>
                    <div className={"invest-last"}>
                        지난시즌 내역
                    </div>
                </div>
                <div className={"content-list"}>

                </div>
            </div>
        </div>
    );
}