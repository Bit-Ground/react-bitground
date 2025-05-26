import React, {useState, useEffect} from 'react';
import {useAuth} from '../auth/useAuth.js'
import './Mypage.css';
import {Navigate} from 'react-router-dom';

export default function Mypage() {
    const {user, loading} = useAuth();
    const [selectedMenu, setSelectedMenu] = useState('invest-info');
    const [nickname, setNickname] = useState('');
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (user) {
            setNickname(user.name || '');
            setPreview(user.profileImage || '');
        }
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const previewURL = URL.createObjectURL(file);
            setPreview(previewURL);
            // 파일 업로드 처리 로직
        }
    };

    const handleSubmit = () => {
        alert(`닉네임: ${nickname}\n프로필 이미지 수정됨`);
        // 실제 수정 API 호출
    };

    if (loading) return <div>로딩 중...</div>;

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
                            <div className="info-edit-container">
                                <div className="form-group">
                                    <label>닉네임</label>
                                    <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)}/>
                                </div>

                                <div className="form-group">
                                    <label>프로필 사진</label>
                                    <input type="file" accept="image/*" onChange={handleImageChange}/>
                                    {preview && <img src={preview} alt="미리보기" className="preview-image"/>}
                                </div>

                                <div className="form-group">
                                    <label>이메일</label>
                                    <input type="email" value={user.email} disabled/>
                                </div>
                                <div className={"form-group"}>
                                    <label>로그인 경로</label>
                                    <input type={"text"} value={user.provider} disabled/>
                                </div>
                                <div className="edit-btns">
                                    <button className="edit-submit-btn" onClick={handleSubmit}>수정하기</button>
                                    <button className="delete-account-btn">회원탈퇴</button>
                                </div>
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