import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

const Callback = () => {
    const navigate = useNavigate();
    const { checkAuthState } = useAuth();

    useEffect(() => {
        const processAuthCallback = async () => {
            try {
                await checkAuthState(); // 인증 콜백 후 상태 확인 및 사용자 정보 로드
                navigate('/'); // 로그인 성공 후 홈으로 이동
            } catch (error) {
                console.error('Error processing auth callback:', error);
                navigate('/'); // 실패 시 로그인 페이지로 (로그인 페이지 = 홈 페이지)
            }
        };

        processAuthCallback();
    }, [checkAuthState, navigate]);

    return (
        <div>
            <p>Processing login...</p>
        </div>
    );
};

export default Callback;