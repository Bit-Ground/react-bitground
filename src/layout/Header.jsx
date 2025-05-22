import "./Header.css"
import "../style.css"
import { LuMoveUpRight} from "react-icons/lu";
import { useNavigate } from "react-router-dom";

export default function Header() {
    const navigate = useNavigate();

    return (
        <header className={"header"}>
            <div className="header-container">
                <div className="logo"
                onClick={()=>navigate("/")}>*Bitground</div>
                <div className={"nav-container"}>
                    <div className={"nav-frame"}>
                    <div className={"nav-list"}>
                        <div className={"nav-sell"}>거래소</div>
                        <div className={"nav-selllist"}>투자내역</div>
                        <div className={"nav-news"}>최신동향</div>
                        <div className={"nav-community"}>커뮤니티</div>
                        <div className={"nav-rank"}>랭킹</div>
                        <div className={"nav-service"}>고객센터</div>
                    </div>
                </div>
                </div>
                <div className="header-btns">
                    <button type={"button"} className="login-btn"
                            onClick={() => navigate("/login")}>로그인<LuMoveUpRight className={"move-icon"}/></button>
                </div>
            </div>
        </header>
    );
}