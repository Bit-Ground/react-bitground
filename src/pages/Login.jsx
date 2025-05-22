import {useAuth} from '../auth/useAuth';
import './Login.css';
import { CiLock } from "react-icons/ci";


export default function Main() {
    const {login, isLoggedIn, loading, user, logout} = useAuth();
    console.log(isLoggedIn, loading);
    if (isLoggedIn && !loading && user) {
        return (
            <div>
                <p>닉네임: <span>{user.name}</span></p>
                <p>이메일: <span>{user.email}</span></p>
                <p>프로필 사진: <img src={user.profileImage} alt="Profile Picture" style={{width: 100}}/></p>
                <p>로그인 경로: <span>{user.provider}</span></p>
                <button onClick={() => logout()}>로그아웃</button>
            </div>
        );
    } else {
        return (
            <div className={"container"}>
            <div className="login-container">
                <div className={"login-title"}>
                <p className={"text-login"}>로그인</p>
                <p className={"text-login-check"}>방문하신 사이트의 주소가 아래와 일치하는지 확인하세요.</p>
                <div className={"text-addr"}><CiLock/>https://www.bitground.kr</div>
                </div>
                <div className={"login-content"}>
                <button onClick={() => login('kakao')} className={"kakao-btn"}>카카오 로그인</button>
                <button onClick={() => login('naver')} className={"naver-btn"}>네이버 로그인</button>
                <button onClick={() => login('google')} className={"google-btn"}>구글 로그인</button>
                </div>
            </div>
            </div>
        );
    }
}