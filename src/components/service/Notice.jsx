import React, { useEffect, useState } from 'react';
import { RiDeleteBinLine } from "react-icons/ri";
import api from '../../api/axiosConfig';
import { useAuth } from '../../auth/useAuth';

const Notice = () => {
    const [notices, setNotices] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [openIds, setOpenIds] = useState([]); // 토글용 상태
    const { user } = useAuth();

    const fetchNotices = async (pageNum = 0) => {
        try {
            const res = await api.get('/api/notices', {
                params: { page: pageNum, size: 10 },
            });
            setNotices(res.data.content);
            setTotalPages(res.data.totalPages);
            setPage(res.data.number);
            setOpenIds([]); // 페이지 변경 시 열려있는 토글 초기화
        } catch (error) {
            console.error("공지사항 불러오기 실패", error);
        }
    };

    useEffect(() => {
        fetchNotices(0); // 첫 페이지 로딩
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < totalPages) {
            fetchNotices(newPage);
        }
    };

    const toggleNotice = (id) => {
        setOpenIds(prev =>
            prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
        );
    };

    return (
        <div className='notice-list'>
            <table className='notice-table'>
                <colgroup>
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '60%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                <tr className='notice-table-head'>
                    <th>번호</th>
                    <th>제목</th>
                    <th></th>
                    <th>작성자</th>
                    <th>등록일</th>
                </tr>
                </thead>
                <tbody>
                {notices.map((notice) => (
                    <React.Fragment key={notice.id}>
                        <tr className='notice-row'>
                            <td>{notice.id}</td>
                            <td
                                className='notice-title'
                                onClick={() => toggleNotice(notice.id)}
                            >
                                {notice.title}
                            </td>
                            <td>
                                {user?.role === 'ROLE_ADMIN' && <RiDeleteBinLine className='delicon' />}
                            </td>
                            <td>{notice.writer}</td>
                            <td>{notice.createdAt?.substring(0, 10)}</td>
                        </tr>
                        {openIds.includes(notice.id) && (
                            <tr>
                                <td className="ask-title" colSpan="5">
                                    <div>
                                        공지사항 : <div dangerouslySetInnerHTML={{ __html: notice.content }} />
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
                <tfoot>
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                        <button
                            className='notice-pagination'
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                        >
                            &lt;
                        </button>
                        <span style={{ margin: '0 10px' }}>{page + 1} / {totalPages}</span>
                        <button
                            className='notice-pagination'
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages - 1}
                        >
                            &gt;
                        </button>
                    </td>
                </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default Notice;