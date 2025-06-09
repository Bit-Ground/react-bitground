import React from 'react';


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
                            <tr className='notice-row'>
                                <td>1</td>
                                <td className='notice-title'>
                                    test
                                </td>
                                <td>관리자</td>
                                <td>0609</td>
                            </tr>
                        </tbody>
                        <tfoot>
                        <tr>
                            <td colSpan="4">
                                <button className='notice-pagination'>
                                    &lt; 이전
                                </button>
                                <button className='notice-pagination'>
                                    다음 &gt;
                                </button>
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