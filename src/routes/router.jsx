// 라우터 설정
import {createBrowserRouter} from "react-router-dom";
import RootLayout from "../layout/RootLayout.jsx";
import Main from "../pages/Main.jsx";
import Callback from "../pages/auth/Callback.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import NewsSearch from "../pages/NewsComponent.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {index: true, element: <Main />},
            {path: "auth/callback", element: <Callback />},
            { path: "news", element: <NewsSearch /> },
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        index: true, // 부모 경로와 동일한 인덱스 경로
                        element: <Main />
                    }
                    // 여기에 보호된 라우트 추가
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