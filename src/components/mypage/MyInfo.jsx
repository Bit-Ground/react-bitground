import React, {useEffect, useState} from "react";
import '../../styles/mypage/MyInfo.css'
import {useAuth} from "../../auth/useAuth.js";
import {softDeleteUser, updateUserInfo} from "../../api/userApi.js";

export default function MyInfo() {
    const {user, loading} = useAuth();

    const [nickname, setNickname] = useState('');
    const [preview, setPreview] = useState('');
    const [email, setEmail] = useState('');
    const [file, setFile] = useState(null); // 실제 업로드용 파일 추가

    useEffect(() => {
        if (user) {
            setNickname(user.name || '');
            setPreview(user.profileImage || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const handleImageChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            const previewURL = URL.createObjectURL(selectedFile);
            setPreview(previewURL); // 미리보기용
            setFile(selectedFile); // 업로드용
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await updateUserInfo(nickname, email, file); // 👈 여기서 await 호출

            alert('수정이 완료되었습니다!');
            console.log('서버 응답:', response);

            window.location.reload(); // 변경 반영 위해 새로고침

        } catch (error) {
            console.error('업데이트 실패:', error);
            alert('수정 중 오류가 발생했습니다.');
        }
    };

    const handleDeleteAccount = async () => {
        const confirm = window.confirm('정말 탈퇴하시겠습니까?');
        if (!confirm) return;

        try {
            await softDeleteUser();
            alert('탈퇴가 완료되었습니다.');
            //로그아웃처리 후 홈으로 리다이렉트
            window.location.href = '/';
        } catch (error) {
            console.error('탈퇴실패:', error);
            alert('탈퇴 중 문제가 발생했습니다.');
        }
    }

    if (loading) return <div>로딩 중...</div>;

    return (
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
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className={"form-group"}>
                <label>로그인 경로</label>
                <input type={"text"} value={user.provider} disabled/>
            </div>
            <div className="edit-btns">
                <button className="edit-submit-btn" onClick={handleSubmit}>수정하기</button>
                <button className="delete-account-btn" onClick={handleDeleteAccount}>회원탈퇴</button>
            </div>
        </div>
    );
}