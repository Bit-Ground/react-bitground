import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { IoIosCloseCircleOutline, IoIosInformationCircleOutline } from "react-icons/io";

// 토스트 타입 정의
const TOAST_TYPES = {
    default: {
        className: 'toast-default',
        showIcon: true,
        icon: IoIosInformationCircleOutline
    },
    error: {
        className: 'toast-error',
        showIcon: true,
        icon: IoIosCloseCircleOutline
    }
};

// Toast Context 생성
const ToastContext = createContext();

// Toast Provider 컴포넌트
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    // 토스트 추가 함수
    const addToast = useCallback((message, type = 'default', duration = 3000) => {
        const id = Date.now() + Math.random();
        const newToast = {
            id,
            message,
            type,
            duration,
            isLeaving: false
        };

        setToasts(prev => [...prev, newToast]);

        // 지정된 시간 후 사라지는 애니메이션 시작
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.map(toast =>
                    toast.id === id ? { ...toast, isLeaving: true } : toast
                ));

                // 애니메이션 후 실제 제거 (300ms 후)
                setTimeout(() => {
                    removeToast(id);
                }, 300);
            }, duration);
        }

        return id;
    }, []);

    // 토스트 제거 함수
    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const value = {
        toasts,
        addToast,
        removeToast // 내부용으로만 사용
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
};

// 개별 Toast 컴포넌트
const Toast = ({ toast }) => {
    const [isVisible, setIsVisible] = useState(false);

    const toastConfig = TOAST_TYPES[toast.type] || TOAST_TYPES.default;
    const IconComponent = toastConfig.icon;

    useEffect(() => {
        // 마운트 시 애니메이션 시작
        setTimeout(() => setIsVisible(true), 10);
    }, []);

    const toastClasses = `
    toast-base 
    ${toastConfig.className}
    ${isVisible && !toast.isLeaving ? 'toast-visible' : 'toast-hidden'}
  `;

    return (
        <div className={toastClasses}>
            {toastConfig.showIcon && IconComponent && (
                <IconComponent size={20} className="toast-icon" />
            )}

            <span className="toast-message">
        {toast.message}
      </span>
        </div>
    );
};

// Toast Container 컴포넌트
const ToastContainer = () => {
    const { toasts, removeToast } = useContext(ToastContext);

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onRemove={removeToast}
                />
            ))}
        </div>
    );
};

// useToast 훅
export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast는 ToastProvider 내부에서 사용되어야 합니다.');
    }

    const { addToast } = context;

    return {
        // 편의 메서드들
        infoAlert: (message, duration) => addToast(message, 'default', duration),
        errorAlert: (message, duration) => addToast(message, 'error', duration),

        // 기본 메서드
        addToast
    };
};

