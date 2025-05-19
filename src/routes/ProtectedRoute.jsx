import React from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../auth/useAuth';

const ProtectedRoute = () => {
    const {isLoggedIn, loading} = useAuth();

    if (loading) {
        return <div>Loading authentication status...</div>; // 또는 스피너
    }

    if (!isLoggedIn) {
        return <Navigate to="/" replace/>;
    }

    return <Outlet/>; // 자식 라우트들을 렌더링
};

export default ProtectedRoute;