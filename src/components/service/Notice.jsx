import React from 'react';

const dummyNotices = [
    { id: 5, title: "6월 점검 안내", writer: "관리자", date: "2025-06-09" },
    { id: 4, title: "신규 기능 출시 안내", writer: "관리자", date: "2025-06-05" },
    { id: 3, title: "시스템 정기 점검 공지", writer: "운영팀", date: "2025-05-30" },
    { id: 2, title: "개인정보 처리방침 변경", writer: "관리자", date: "2025-05-20" },
    { id: 1, title: "커뮤니티 이용 가이드", writer: "관리자", date: "2025-05-10" },
];

const Notice = () => {
    return (
        <div>
            <div>
                <div className='notice-list'>
                    <table className='notice-table'>
                        <colgroup>
                            <col style={{ width: '5%' }} />
                            <col style={{ width: '70%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '10%' }} />
                        </colgroup>
                        <thead>
                        <tr className='notice-table-head'>
                            <th>번호</th>
                            <th>제목</th>
                            <th>작성자</th>
                            <th>등록일</th>
                        </tr>
                        </thead>
                        <tbody>
                        {dummyNotices.map((notice) => (
                            <tr key={notice.id} className='notice-row'>
                                <td>{notice.id}</td>
                                <td className='notice-title'>{notice.title}</td>
                                <td>{notice.writer}</td>
                                <td>{notice.date}</td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                <button className='notice-pagination'>&lt; </button>
                                <button className='notice-pagination'> &gt;</button>
                            </td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Notice;