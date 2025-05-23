import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

const Callback = () => {
    const navigate = useNavigate();
    const { checkAuthState } = useAuth();

    useEffect(() => {
        checkAuthState()
            .then(() => {
                navigate('/'); // 로그인 성공 후 홈으로 이동
            })
            .catch((error) => {
                console.error('Error processing auth callback:', error);
                navigate('/login'); // 실패 시 로그인 페이지로 이동
            });
    }, [checkAuthState, navigate]);

    return (
        <div>
            <p>Processing login...</p>
        </div>
    );
};

export default Callback;