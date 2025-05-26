import "./Header.css"
import "../style.css"
import {MdArrowOutward} from "react-icons/md";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../auth/useAuth";
import {useLocation} from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();

    const {logout} = useAuth();

    const location = useLocation();
    const path = location.pathname;

    return (
        <header className={"header"}>
            <div className="header-container">
                <div className="logo" onClick={() => navigate("/")}>
                    *Bitground
                </div>

                <div className={"nav-container"}>
                    <div className={"nav-frame"}>
                        <div className={"nav-list"}>
                            <div className={`nav-sell ${path === "/trade" ? "active" : ""}`}
                                 onClick={() => navigate("/trade")}>
                                거래소
                            </div>
                            <div className={`nav-selllist ${path === "/selllist" ? "active" : ""}`}
                                 onClick={() => navigate("/selllist")}>
                                투자내역
                            </div>
                            <div className={`nav-news ${path === "/news" ? "active" : ""}`}
                                 onClick={() => navigate("/news")}>
                                최신동향
                            </div>
                            <div className={`nav-community ${path === "/community" ? "active" : ""}`}
                                 onClick={() => navigate("/community")}>
                                커뮤니티
                            </div>
                            <div className={`nav-rank ${path === "/rank" ? "active" : ""}`}
                                 onClick={() => navigate("/rank")}>
                                랭킹
                            </div>
                            <div className={`nav-service ${path === "/service" ? "active" : ""}`}
                                 onClick={() => navigate("/service")}>
                                고객센터
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-btns">
                    {localStorage.getItem("authState") ? (
                        <>
                            <div className={`mypage-btn ${path === "/mypage" ? "active" : ""}`}
                                 onClick={() => navigate("/mypage")}>
                                마이페이지
                                <MdArrowOutward className="my-move-icon"/>
                            </div>
                            <button
                                type="button"
                                className="logout-btn"
                                onClick={logout}
                            >
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="login-btn"
                            onClick={() => navigate("/login")}
                        >
                            로그인 <MdArrowOutward className="move-icon"/>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}