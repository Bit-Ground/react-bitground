import React, { useEffect, useState } from 'react';
import "./post.css";
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import api from "../api/axiosConfig.js";
import { useAuth } from '../auth/useAuth.js';


/**
 * 게시글 상세 페이지 컴포넌트
 * - URL 파라미터로 전달된 게시글 ID를 기반으로 상세 정보를 표시
 * - 게시글 내용, 작성자 정보, 조회수, 좋아요/싫어요 수, 댓글 등을 포함
 * - 좋아요/싫어요 기능과 댓글 작성 기능 제공
 */
const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const user = useAuth();
    const location = useLocation();


    /**
     * 게시글 데이터 불러오기
     * - 컴포넌트 마운트 시 또는 게시글 ID 변경 시 실행
     * - API를 통해 게시글 상세 정보를 가져옴
     * - 실패 시 커뮤니티 메인 페이지로 리다이렉트
     */
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const forceViewCount = searchParams.get('forceViewCount');
        const fetchPost = async () => {
            try {
                if (forceViewCount) {
                    // ✅ 조회수 증가 요청
                    api.get(`/api/posts/${id}?forceViewCount=true`).then(res => {
                        setPost(res.data);

                        // ✅ URL에서 쿼리스트링 제거
                        window.history.replaceState({}, '', `/community/${id}`);
                    });
                } else {
                    // 새로고침 시 or 파라미터 없는 경우 → 조회수 증가 안 함
                    api.get(`/api/posts/${id}`).then(res => setPost(res.data));
                }
            } catch {
                alert('게시글을 불러오는 데 실패했습니다.');
                navigate('/community');
            }
        };
        fetchPost();
    }, [id]);

    /**
     * 좋아요 기능 처리
     * - 현재 게시글에 대한 좋아요 요청을 서버에 전송
     * - 성공 시 좋아요 수 업데이트
     */
    const handleLike = async () => {
        const res = await api.post(`/api/posts/${id}/like`);
        setPost(prev => ({ ...prev, likes: res.data }));
    };

    /**
     * 싫어요 기능 처리
     * - 현재 게시글에 대한 싫어요 요청을 서버에 전송
     * - 성공 시 싫어요 수 업데이트
     */
    const handleDislike = async () => {
        const res = await api.post(`/api/posts/${id}/dislike`);
        setPost(prev => ({ ...prev, dislikes: res.data }));
    };

    // 게시글 로딩 중이거나 찾을 수 없는 경우 표시할 UI
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
            {/* 상단 네비게이션 버튼 */}
            <div className='postheader'>
                <button type='button' className='listbtn' onClick={() => navigate('/community')}> &lt; 목록 </button>&nbsp;&nbsp;
                <button type='button' className='writebtn' onClick={() => navigate('/community/write')}> 📝 글쓰기</button>
            </div>

            {/* 게시글 본문 및 댓글 영역 */}
            <div className='post-detail'>
                {/* 게시글 내용 영역 */}
                <div className='post-detail-content'>
                    <div className='post-detail-header'>
                        <h2 className='post-detail-title'>
                            [{post.category}] {post.title}
                        </h2>
                        <div className='post-detail-info'>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <img src={user.user.profileImage} alt="프로필" className='profile-image' />
                                <span style={{ marginLeft: '10px', marginRight: '20px' }}>[{post.tier}]{post.name}</span>
                                <span>{post.CreatedAt}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '20px' }}>조회 {post.views}</span>
                                <span>좋아요 {post.likes}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* 게시글 본문 */}
                    <div className='post-detail-body'
                        dangerouslySetInnerHTML={{ __html: post.content }}>
                    </div>
                    
                    {/* 좋아요/싫어요 버튼 영역 */}
                    <div className='post-detail-footer'>
                        <button onClick={handleLike} className='likebtn' style={{ marginRight: '10px' }}>👍 좋아요({post.likes})</button>
                        <button onClick={handleDislike} className='dislikebtn'>👎 싫어요({post.dislikes})</button>
                    </div>
                </div>

                {/* 댓글 영역 */}
                <div className='post-comments'>
                    <div style={{ marginBottom: '15px' }}>
                        <b>댓글 {post.comments}</b>
                    </div>
                    {/* 댓글 입력 폼 */}
                    <div className='comment-input-area'>
                        <textarea 
                            placeholder='댓글을 입력해주세요' 
                            className='comment-textarea'
                        />
                        <div style={{ textAlign: 'right' }}>
                            <button className='writebtn'>댓글 작성</button>
                        </div>
                    </div>
                    
                    {/* 댓글 목록 */}
                    <div className='comment-list'>
                        {/* 댓글 목록이 있다면 여기에 표시 */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;