import React from 'react';
import { RiDeleteBinLine } from "react-icons/ri";
import { LuPencilLine } from "react-icons/lu";


const Ask = () => {
    return (
        <div>
            <div>
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
                            <tr className='ask-row'>
                                <td>1</td>
                                <td className='ask-title'>
                                    test
                                </td>
                                <td><LuPencilLine className='writeicon'/>
                                    <RiDeleteBinLine className='delicon'/></td>
                                <td>작성자</td>
                                <td>0609</td>
                            </tr>
                            </tbody>
                            <tfoot>
                            <tr>
                                <td colSpan="4">
                                    <button className='ask-pagination'>
                                        &lt; 이전
                                    </button>
                                    <button className='ask-pagination'>
                                        다음 &gt;
                                    </button>
                                </td>
                            </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Ask;