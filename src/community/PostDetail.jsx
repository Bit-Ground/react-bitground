import React from 'react';
import "./post.css";
import { useNavigate } from 'react-router-dom';

const PostDetail = () => {
    const navigate = useNavigate();

    const handleList = () => {
        navigate('/community');
    };

    const handleWrite = () => {
        navigate('/community/write');
    };

    return (
        <div>
            <div className='postheader'>
                <button type='button' className='listbtn' onClick={handleList}> &lt; 목록 </button>&nbsp;&nbsp;
                <button type='button' className='writebtn' onClick={handleWrite}> 📝 글쓰기</button>
            </div>
             <div className='postlist'>
                <table className='posttable'>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', paddingLeft: '0' }}>[카테고리]</th>
                            <th style={{ textAlign: 'left', paddingLeft: '0' }}>제목</th>
                        </tr>
                        <tr>
                            <th style={{ textAlign: 'left', paddingLeft: '0' }}>[티어][닉네임]</th>
                            <th style={{ textAlign: 'left', paddingLeft: '0' }}>[작성시간]</th>
                            <th style={{ textAlign: 'right', paddingRight: '0' }}>[조회수]</th>
                            <th style={{ textAlign: 'right', paddingRight: '0' }}>[추천수]</th>
                            <th style={{ textAlign: 'right', paddingRight: '0' }}>[댓글]</th>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <div style={{ height: '1px', backgroundColor: '#ccc' }}></div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>[내용]</td>
                        </tr>
                        <tr>
                            <td>[사진]</td>
                        </tr>
                        <tr>
                            <td><button>[추천버튼]</button></td>
                            <td>[사용자정보카드]</td>
                        </tr>
                        <tr>
                            <td>[댓글수]</td>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <div style={{ height: '1px', backgroundColor: '#ccc' }}></div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td>[티어][닉네임]</td>
                            <td>[작성시간]</td>
                            <td><button>[추천버튼]</button></td>
                            <td><button>[답글달기버튼]</button></td>
                        </tr>
                        <tr>
                            <td>[댓글]</td>
                        </tr>
                    </tfoot>
                </table>
                <div>
                    <b>댓글달기</b>
                    <br/>
                    <textarea placeholder='내용을 입력해주세요'></textarea>
                </div>
                <button type='button' className='listbtn' onClick={handleList}> &lt; 목록 </button>
            </div>
        </div>
    );
};

export default PostDetail;