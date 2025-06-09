import React from 'react';
import { RiDeleteBinLine } from "react-icons/ri";
import { LuPencilLine } from "react-icons/lu";

const dummyQuestions = [
    { id: 3, title: "회원 탈퇴는 어디서 하나요?", writer: "user01", date: "2025-06-09" },
    { id: 2, title: "게시글 수정은 어떻게 하나요?", writer: "user02", date: "2025-06-08" },
    { id: 1, title: "비밀번호를 잊어버렸어요", writer: "user03", date: "2025-06-07" },
];

const Ask = () => {
    return (
        <div>
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
                    {dummyQuestions.map((q) => (
                        <tr key={q.id} className='ask-row'>
                            <td>{q.id}</td>
                            <td className='ask-title'>{q.title}</td>
                            <td>
                                <LuPencilLine className='writeicon' />
                                <RiDeleteBinLine className='delicon' />
                            </td>
                            <td>{q.writer}</td>
                            <td>{q.date}</td>
                        </tr>
                    ))}
                    </tbody>
                    <tfoot>
                    <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                            <button className='ask-pagination'>&lt; </button>
                            <button className='ask-pagination'> &gt;</button>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default Ask;