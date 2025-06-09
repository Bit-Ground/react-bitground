import Ask from "../components/service/Ask.jsx";
import AskWrite from "../components/service/AskWrite.jsx";
import Notice from "../components/service/Notice.jsx";
import React, {useState} from "react";
import "../styles/service/service.css";

export default function Service() {
    const [selectedMenu, setSelectedMenu] = useState('notice');
    return (
        <div>
            <div>
                <div className={"service"}>
                    <div className="service-container">
                        <div className={"service-title"}>
                            * 고객센터
                            <input type={"text"} placeholder="search" style={{marginLeft: 'auto', height: '40px', width: '200px'}}/>
                        </div>
                        <div className={"service-content"}>
                            <div className={"service-list"}>
                                <div className={`notice ${selectedMenu === 'notice' ? 'active' : ''}`}
                                     onClick={() => setSelectedMenu('notice')}>
                                    공지사항
                                </div>
                                <div className={`ask ${selectedMenu === 'ask' ? 'active' : ''}`}
                                     onClick={() => setSelectedMenu('ask')}>
                                    1:1 문의사항
                                </div>
                                <button type='button' className='askbtn' onClick={() => setSelectedMenu('askwrite')}>
                                    문의하기
                                </button>
                            </div>

                            <div className={"content-list"}>
                                {selectedMenu === 'notice' && (
                                    <Notice />
                                )}
                                {selectedMenu === 'ask' && (
                                    <Ask/>
                                )}
                                {selectedMenu === 'askwrite' && (
                                    <AskWrite/>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}