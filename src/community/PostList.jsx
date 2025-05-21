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
                <h3>test</h3>
            </div>
        </div>
    );
};

export default PostList;