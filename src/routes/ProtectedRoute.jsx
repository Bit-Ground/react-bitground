import React, {useEffect} from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../auth/useAuth';

const ProtectedRoute = () => {
    const {checkAuthState, isLoggedIn, loading} = useAuth();

    useEffect(() => {
        // 보호된 라우트에서만 인증 상태 확인
        checkAuthState();
    }, [checkAuthState]);

    if (loading) return <div>Loading authentication status...</div>; // 또는 스피너
    if (!isLoggedIn) return <Navigate to="/login" replace/>;

    return <Outlet/>; // 자식 라우트들을 렌더링
};

export default ProtectedRoute;