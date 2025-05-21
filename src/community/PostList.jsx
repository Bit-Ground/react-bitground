import React from 'react';
import "./post.css";
const PostList = () => {
    return (
        <div>
            <div className='postheader'>
                <button type='button' className='listbtn'> &lt; 목록 </button>&nbsp;&nbsp;
                <button type='button' className='writebtn'> 📝 글쓰기</button>
            </div>
            <div className='postlist'>
                <table className='posttable'>
                    <thead className='postbtns'>
                       <tr>
                            <th colSpan="5" style={{ textAlign: 'left' }}>
                            <div className="button-group">
                                <button>전체</button>
                                <button>잡담</button>
                                <button>질문</button>
                                <button>정보</button>
                            </div>
                            </th>
                            <th style={{ textAlign: 'right' }}>
                            <select className="sort">
                                <option value="latest">최신순</option>
                                <option value="oldest">오래된순</option>
                                <option value="popular">인기순</option>
                            </select>
                            </th>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <div style={{ height: '1px', backgroundColor: '#ccc' }}></div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ verticalAlign: 'middle', paddingLeft: '5px' }}>번호</td>
                            <td style={{ verticalAlign: 'middle' }}>제목</td>
                            <td style={{ verticalAlign: 'middle' }}>글쓴이</td>
                            <td style={{ verticalAlign: 'middle' }}>등록일</td>
                            <td style={{ verticalAlign: 'middle' }}>조회수</td>
                            <td style={{ verticalAlign: 'middle' }}>추천수</td>
                        </tr>

                        <tr>
                            <td colSpan="6">
                            <div style={{ height: '1px', backgroundColor: '#ccc' }} />
                            </td>
                        </tr>

                        <tr>
                            <td style={{ verticalAlign: 'middle', paddingLeft: '5px' }}>1</td>
                            <td style={{ verticalAlign: 'middle' }}>제목</td>
                            <td style={{ verticalAlign: 'middle' }}>글쓴이</td>
                            <td style={{ verticalAlign: 'middle' }}>등록일</td>
                            <td style={{ verticalAlign: 'middle' }}>조회수</td>
                            <td style={{ verticalAlign: 'middle' }}>추천수</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>pagination</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PostList;