import {useAuth} from '../auth/useAuth';

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
            <div>
                <button onClick={() => login('kakao')}>카카오 로그인</button>
                <button onClick={() => login('naver')}>네이버 로그인</button>
                <button onClick={() => login('google')}>구글 로그인</button>
            </div>
        );
    }
}