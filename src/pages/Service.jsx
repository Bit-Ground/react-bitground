import Ask from "../components/service/Ask.jsx";
import AskWrite from "../components/service/AskWrite.jsx";
import Notice from "../components/service/Notice.jsx";
import React, {useState, useEffect} from "react";
import "../styles/service/service.css";
import {useAuth} from "../auth/useAuth.js";
import NoticeWrite from "../components/service/NoticeWrite.jsx";


export default function Service() {
    const [selectedMenu, setSelectedMenu] = useState('notice');
    const { user } = useAuth();
    const isAdmin = user?.role === 'ROLE_ADMIN';

    useEffect(() => {
        const saved = localStorage.getItem('serviceMenu');
        if (saved === 'ask') {
            setSelectedMenu('ask');
            localStorage.removeItem('serviceMenu'); // 한 번만 사용하고 제거
        }
    }, []);
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
                                {!isAdmin ? (
                                    <button
                                        type='button'
                                        className='askbtn'
                                        onClick={() => setSelectedMenu('askwrite')}
                                    >
                                        문의하기
                                    </button>
                                ) : (
                                    <button
                                        type='button'
                                        className='askbtn'
                                        onClick={() => setSelectedMenu('noticewrite')}
                                    >
                                        공지등록
                                    </button>
                                )}
                            </div>

                            <div className={"content-list"}>
                                {selectedMenu === 'notice' && (
                                    <Notice />
                                )}
                                {selectedMenu === 'ask' && (
                                    <Ask/>
                                )}
                                {selectedMenu === 'askwrite' && (
                                    <AskWrite setSelectedMenu={setSelectedMenu} />
                                )}
                                {selectedMenu === 'noticewrite'
                                    && <NoticeWrite setSelectedMenu={setSelectedMenu} />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}