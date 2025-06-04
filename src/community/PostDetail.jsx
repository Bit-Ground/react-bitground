import React, { useEffect, useState } from 'react';
import "./post.css";
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import api from "../api/axiosConfig.js";
import { useAuth } from '../auth/useAuth.js';

/**
 * 날짜를 yyyy-mm-dd HH:mm 형식으로 포맷팅하는 함수
 */
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 댓글 컴포넌트
 */
const Comment = ({ comment, onReply, onDelete, currentUserId, user, replyTargetId }) => {
    const [showReplies, setShowReplies] = useState(false);
    const hasReplies = comment.children && comment.children.length > 0;
    const isReply = comment.parentId !== null; // 답글 여부 확인
    
    const toggleReplies = () => {
        setShowReplies(!showReplies);
    };

    const handleReplyClick = () => {
        if (replyTargetId === comment.id) {
            onReply(null);
        } else {
            onReply(comment.id);
        }
    };

    return (
        <div className="comment-item">
            <div className="comment-header">
                <div className="comment-user-info">
                    <span className="comment-tier">[{comment.userTier || '일반'}]</span>
                    <span className="comment-username">{comment.userName}</span>
                    <span className="comment-date">({formatDate(comment.createdAt)})</span>
                </div>
            </div>
            
            <div className="comment-content">
                {comment.content}
            </div>

            <div className="comment-actions">
                <button className="comment-action-btn">
                    <span>👍</span>
                    <span>{comment.likes}</span>
                </button>
                {!isReply && ( // 답글이 아닌 경우에만 답글 버튼 표시
                    <button 
                        className="comment-action-btn"
                        onClick={handleReplyClick}
                    >
                        <span>💬</span>
                        <span>답글달기</span>
                    </button>
                )}
                {comment.userId === currentUserId && (
                    <button 
                        className="comment-action-btn danger"
                        onClick={() => onDelete(comment.id)}
                    >
                        <span>🗑️</span>
                        <span>삭제</span>
                    </button>
                )}
            </div>

            {/* 답글 토글 버튼 (답글이 있고 원본 댓글인 경우에만 표시) */}
            {hasReplies && !isReply && (
                <div className="reply-toggle" onClick={toggleReplies}>
                    {showReplies ? '답글 숨기기 ▼' : `${comment.children.length}개의 답글 보기 ▶`}
                </div>
            )}

            {/* 답글 목록 */}
            {showReplies && hasReplies && (
                <div className="comment-replies">
                    {comment.children.map(reply => (
                        <Comment
                            key={reply.id}
                            comment={reply}
                            onReply={onReply}
                            onDelete={onDelete}
                            currentUserId={currentUserId}
                            user={user}
                            replyTargetId={replyTargetId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

/**
 * 댓글 입력 폼 컴포넌트
 */
const CommentForm = ({ value, onChange, onSubmit, buttonText, isReply = false }) => {
    return (
        <div className={isReply ? "reply-form-container" : "comment-input-area"}>
            <textarea
                placeholder={isReply ? '답글을 입력하세요' : '댓글을 입력하세요'}
                className={isReply ? "reply-input" : "comment-textarea"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <div style={{ textAlign: 'right' }}>
                <button className='writebtn' onClick={onSubmit}>{buttonText}</button>
            </div>
        </div>
    );
};

/**
 * 게시글 상세 페이지 컴포넌트
 * - URL 파라미터로 전달된 게시글 ID를 기반으로 상세 정보를 표시
 * - 게시글 내용, 작성자 정보, 조회수, 좋아요/싫어요 수, 댓글 등을 포함
 * - 좋아요/싫어요 기능과 댓글 작성 기능 제공
 */
const PostDetail = () => {
    // 상태 및 훅 초기화
    const { id } = useParams();
    const postId = parseInt(id);
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAuth();
    
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [commentContent, setCommentContent] = useState("");
    const [replyTargetId, setReplyTargetId] = useState(null);
    const [replyContent, setReplyContent] = useState("");

    // 댓글 관련 함수들
    const commentHandlers = {
        reloadComments: () => {
            api.get(`/api/comments/post/${id}`)
                .then(res => setComments(res.data));
        },

        submitComment: () => {
            if (!commentContent.trim()) return;

            api.post("/api/comments", {
                postId: id,
                userId: user.id,
                content: commentContent,
                parentId: null
            }).then(() => {
                setCommentContent("");
                commentHandlers.reloadComments();
            });
        },

        submitReply: (parentId) => {
            if (!replyContent.trim()) return;

            api.post("/api/comments", {
                postId,
                userId: user.user.id,
                content: replyContent,
                parentId: parentId
            }).then(() => {
                setReplyContent("");
                setReplyTargetId(null);
                commentHandlers.reloadComments();
            });
        },

        deleteComment: async (commentId) => {
            const confirmed = window.confirm("댓글을 삭제하시겠습니까?");
            if (!confirmed) return;

            try {
                await api.delete(`/api/comments/${commentId}`, {
                    params: { userId: user.user.id }
                });
                commentHandlers.reloadComments();
            } catch (err) {
                alert("댓글 삭제 실패");
                console.error(err);
            }
        },

        renderComments: (commentsArray) => {
            if (!Array.isArray(commentsArray)) return null;

            return commentsArray.map(comment => (
                <React.Fragment key={comment.id}>
                    <Comment
                        comment={comment}
                        onReply={setReplyTargetId}
                        onDelete={commentHandlers.deleteComment}
                        currentUserId={user.user.id}
                        user={user.user}
                        replyTargetId={replyTargetId}
                    />
                    
                    {replyTargetId === comment.id && (
                        <CommentForm
                            value={replyContent}
                            onChange={setReplyContent}
                            onSubmit={() => {
                                commentHandlers.submitReply(comment.id);
                                setReplyTargetId(null); // 답글 작성 후 입력창 닫기
                            }}
                            buttonText="답글 등록"
                            isReply={true}
                        />
                    )}
                </React.Fragment>
            ));
        }
    };

    /**
     * 게시글 데이터 불러오기
     * - 컴포넌트 마운트 시 또는 게시글 ID 변경 시 실행
     * - API를 통해 게시글 상세 정보를 가져옴
     * - 실패 시 커뮤니티 메인 페이지로 리다이렉트
     * - 조회수 증가 및 새로고침 시 조회수 증가 x
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
    }, [id, location.search, navigate]);

    // 댓글 데이터 로딩
    useEffect(() => {
        commentHandlers.reloadComments();
    }, [id]);

    // 좋아요/싫어요 핸들러
    const likeHandlers = {
        handleLike: async () => {
            const res = await api.post(`/api/posts/${id}/like`);
            setPost(prev => ({ ...prev, likes: res.data }));
        },

        handleDislike: async () => {
            const res = await api.post(`/api/posts/${id}/dislike`);
            setPost(prev => ({ ...prev, dislikes: res.data }));
        }
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
                                <span style={{ marginLeft: '10px', marginRight: '20px' }}>[{post.tier || '일반'}] {post.name}</span>
                                <span>({formatDate(post.createdAt)})</span>
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
                        <button onClick={likeHandlers.handleLike} className='likebtn' style={{ marginRight: '10px' }}>👍 좋아요({post.likes})</button>
                        <button onClick={likeHandlers.handleDislike} className='dislikebtn'>👎 싫어요({post.dislikes})</button>
                    </div>
                </div>

                {/* 댓글 영역 */}
                <div className='post-comments'>
                    <div className="comment-count">
                        댓글 {post.comment}개
                    </div>
                    
                    <CommentForm
                        value={commentContent}
                        onChange={setCommentContent}
                        onSubmit={commentHandlers.submitComment}
                        buttonText="댓글 작성"
                    />

                    <div className='comment-list'>
                        {comments.map(comment => (
                            <React.Fragment key={comment.id}>
                                <Comment
                                    comment={comment}
                                    onReply={setReplyTargetId}
                                    onDelete={commentHandlers.deleteComment}
                                    currentUserId={user.user.id}
                                    user={user.user}
                                    replyTargetId={replyTargetId}
                                />
                                
                                {replyTargetId === comment.id && (
                                    <CommentForm
                                        value={replyContent}
                                        onChange={setReplyContent}
                                        onSubmit={() => {
                                            commentHandlers.submitReply(comment.id);
                                            setReplyTargetId(null); // 답글 작성 후 입력창 닫기
                                        }}
                                        buttonText="답글 등록"
                                        isReply={true}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetail;