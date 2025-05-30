import {createBrowserRouter, Outlet} from "react-router-dom";
import RootLayout from "../layout/RootLayout.jsx";
import Main from "../pages/Main.jsx";
import Callback from "../pages/auth/Callback.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Trade from "../pages/Trade.jsx";
import Login from "../pages/Login.jsx";
import PostList from "../community/PostList.jsx";
import PostWrite from "../community/PostWrite.jsx";
import PostDetail from "../community/PostDetail.jsx";
import Mypage from "../pages/Mypage.jsx";
import CoinTrends from "../components/CoinTrends.jsx";
import Rank from "../pages/Rank.jsx";
import Investments from "../pages/Investments.jsx";
import {TickerProvider} from "../ticker/TickerProvider.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {index: true, element: <Main />},
            {path: "auth/callback", element: <Callback />},
            {path: "login", element: <Login /> },
            {
                element: <ProtectedRoute />,
                children: [
                    // 여기에 보호된 라우트 추가
                    { path: "rank", element: <Rank/> },
                    { path: "trends", element: <CoinTrends/> },
                    { path: "mypage", element: <Mypage /> },
                    // upbit ticker
                    {
                        element: <TickerProvider><Outlet/></TickerProvider>,
                        children: [
                            { path: "trade",       element: <Trade/> },
                            { path: "investments", element: <Investments/> },
                        ]
                    },
                    {
                    path: "community",
                    children: [
                        { index: true, element: <PostList /> },         // /community
                        { path: "write", element: <PostWrite /> },      // /community/write
                        { path: ":id", element: <PostDetail /> }      // /community/:id
                    ]
                    }
                ]
            }
        ]
    }
]);

export default router;