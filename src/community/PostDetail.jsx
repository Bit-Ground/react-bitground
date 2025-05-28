import React, { useEffect, useState } from 'react';
import "./post.css";
import { useNavigate, useParams } from 'react-router-dom';
import api from "../api/axiosConfig.js";

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/api/posts/${id}`);
                setPost(res.data);
            } catch (err) {
                alert('게시글을 불러오는 데 실패했습니다.');
                navigate('/community');
            }
        };
        fetchPost();
    }, [id]);


    if (!post) {
        return (
            <div>
                <div className='postheader'>
                    <button type='button' className='listbtn' onClick={() => navigate('/community')}> &lt; 목록 </button>
                </div>
                <div className='postlist'>
                    <p style={{ textAlign: 'center', padding: '20px' }}>게시글을 찾을 수 없습니다. !</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className='postheader'>
                <button type='button' className='listbtn' onClick={() => navigate('/community')}> &lt; 목록 </button>&nbsp;&nbsp;
                <button type='button' className='writebtn' onClick={() => navigate('/community/write')}> 📝 글쓰기</button>
            </div>
            <div className='postlist'>
                <table style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th colSpan="2" style={{ padding: '20px', fontSize: '1.2em', textAlign: 'left' }}>
                                [{post.category}] {post.title}
                            </th>
                        </tr>
                        <tr>
                            <td style={{ padding: '10px 20px' }}>
                                <span style={{ marginRight: '20px' }}>[{post.tier}] {post.name}</span>
                                <span>{post.CreatedAt}</span>
                            </td>
                            <td style={{ textAlign: 'right', padding: '10px 20px' }}>
                                <span style={{ marginRight: '20px' }}>조회 {post.views}</span>
                                <span style={{ marginRight: '20px' }}>좋아요 {post.likes}</span>
                                <span>댓글 </span>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <div style={{ height: '1px', backgroundColor: '#ccc' }}></div>
                            </td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td colSpan="2" style={{ padding: '20px', whiteSpace: 'pre-line', minHeight: '200px' }}
                                dangerouslySetInnerHTML={{ __html: post.content }}>
                                {post.hasImage && (
                                    <div style={{ marginTop: '20px' }}>
                                        <img src="" alt="게시글 이미지" style={{ maxWidth: '100%' }} />
                                    </div>
                                )}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <div style={{ height: '1px', backgroundColor: '#ccc' }}></div>
                            </td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="2" style={{ padding: '20px', textAlign: 'center' }}>
                                <button className='listbtn' style={{ marginRight: '10px' }}>👍 좋아요({post.likes})</button>
                                <button className='listbtn'>👎 싫어요({post.dislikes})</button>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="2">
                                <div style={{ padding: '20px' }}>
                                    <div style={{ marginBottom: '10px' }}><b>댓글 {post.comments}</b></div>
                                    <textarea 
                                        placeholder='댓글을 입력해주세요' 
                                        style={{ 
                                            width: '100%', 
                                            height: '100px', 
                                            padding: '10px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            resize: 'none'
                                        }}
                                    />
                                    <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                        <button className='writebtn'>댓글 작성</button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PostDetail;