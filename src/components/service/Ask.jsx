import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { RiDeleteBinLine } from "react-icons/ri";
import { LuPencilLine } from "react-icons/lu";
import "../../styles/service/service.css";

const Ask = () => {
    const [inquiries, setInquiries] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchInquiries = async (pageNumber = 0) => {
        try {
            const res = await api.get(`/api/inquiries?page=${pageNumber}&size=10`);
            setInquiries(res.data.content);
            setTotalPages(res.data.totalPages);
            setCurrentPage(res.data.number);
        } catch (error) {
            console.error('문의사항 불러오기 실패:', error);
        }
    };

    useEffect(() => {
        fetchInquiries(currentPage);
    }, [currentPage]);

    return (
        <div className='ask-list'>
            <table className='ask-table'>
                <colgroup>
                    <col style={{ width: '5%' }} />
                    <col style={{ width: '60%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '15%' }} />
                    <col style={{ width: '10%' }} />
                </colgroup>
                <thead>
                <tr className='ask-table-head'>
                    <th>번호</th>
                    <th>제목</th>
                    <th></th>
                    <th>작성자</th>
                    <th>등록일</th>
                </tr>
                </thead>
                <tbody>
                {inquiries.map((q) => (
                    <tr key={q.id} className='ask-row'>
                        <td>{q.id}</td>
                        <td className='ask-title'>{q.title}</td>
                        <td>
                            <LuPencilLine className='writeicon' />
                            <RiDeleteBinLine className='delicon' />
                        </td>
                        <td>{q.writer}</td>
                        <td>{q.createdAt?.slice(0, 10)}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* 페이지네이션 */}
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <button
                    className="pagination-btn"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}>
                    &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i}
                        className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
                        onClick={() => setCurrentPage(i)}>
                        {i + 1}
                    </button>
                ))}
                <button
                    className="pagination-btn"
                    disabled={currentPage === totalPages - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}>
                     &gt;
                </button>
            </div>
        </div>
    );
};

export default Ask;