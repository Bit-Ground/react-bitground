import {createBrowserRouter} from "react-router-dom";
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
import Rank from "../pages/Rank.jsx";
import Investments from "../pages/Investments.jsx";

const router = createBrowserRouter([
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
                    { path: "trade", element: <Trade/> },
                    { path: "mypage", element: <Mypage /> },
                    {
                        path: "community",
                        children: [
                            { index: true, element: <PostList /> },         // /community
                            { path: "write", element: <PostWrite /> },      // /community/write
                            { path: ":id", element: <PostDetail /> }        // /community/:id
                        ]
                    },
                    { path: "rank", element: <Rank/> },
                    { path: "investments", element: <Investments/> }
                ]
            }
        ]
    }
]);


// // 라우터 설정 예시
// const router = createBrowserRouter([
//     {
//         path: "/",
//         element: <RootLayout />,
//         children: [
//             { index: true, element: <HomePage /> }, // 루트 경로 (/)
//             { path: "about", element: <AboutPage /> }, // /about
//             {
//                 path: "dashboard",
//                 element: <DashboardLayout />,
//                 children: [
//                     { index: true, element: <DashboardHomePage /> }, // /dashboard
//                     { path: "settings", element: <DashboardSettingsPage /> } // /dashboard/settings
//                 ]
//             }
//         ]
//     }
// ]);

export default router;