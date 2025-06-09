import React, { useEffect, useState } from 'react';
import "../../styles/community/post.css";
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import api from "../../api/axiosConfig.js";
import { useAuth } from '../../auth/useAuth.js';

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};

const CommentForm = ({ value, onChange, onSubmit, buttonText, isReply = false }) => (
    <div className={isReply ? "reply-form-container" : "comment-input-area"}>
        <div className="comment-wrapper">
              <textarea
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  maxLength={255}
                  placeholder={isReply ? '답글을 입력하세요' : '댓글을 입력하세요'}
                  className={isReply ? "reply-input" : "comment-textarea"}
              />
            <div className="char-count-inside">
                ({value.length}/255)
            </div>
        </div>
        <div style={{ textAlign: 'right' }}>
            <button className='writebtn' onClick={onSubmit}>{buttonText}</button>
        </div>
    </div>
);

const PostDetail = () => {
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
    const [openRepliesMap, setOpenRepliesMap] = useState({});
    const [commentCount, setCommentCount] = useState(0);

    const toggleReplies = (commentId) => {
        setOpenRepliesMap(prev => ({ ...prev, [commentId]: !prev[commentId] }));
    };

    const Comment = ({ comment, onReply, onDelete, currentUserId, replyTargetId }) => {
        const hasReplies = comment.children && comment.children.length > 0;
        const isReply = comment.parentId !== null;

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
                <div className="comment-content">{comment.content}</div>
                <div className="comment-actions">
                    <button className="comment-action-btn" onClick={() => sendReaction({
                        userId: user.user.id,
                        targetType: 'COMMENT',
                        targetId: comment.id,
                        liked: true
                    })}>👍 {comment.likes}</button>
                    <button className="comment-action-btn" onClick={() => sendReaction({
                        userId: user.user.id,
                        targetType: 'COMMENT',
                        targetId: comment.id,
                        liked: false
                    })}>👎{comment.dislikes}</button>
                    {!isReply && <button className="comment-action-btn" onClick={handleReplyClick}>💬 답글달기</button>}
                    {comment.userId === currentUserId && <button className="comment-action-btn danger" onClick={() => onDelete(comment.id)}>🗑️ 삭제</button>}
                </div>
                {hasReplies && !isReply && (
                    <div className="reply-toggle" onClick={() => toggleReplies(comment.id)}>
                        {openRepliesMap[comment.id] ? '답글 숨기기 ▼' : `${comment.children.length}개의 답글 보기 ▶`}
                    </div>
                )}
                {openRepliesMap[comment.id] && hasReplies && (
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

    const commentHandlers = {
        reloadComments: () => {
            api.get(`/api/comments/post/${id}`).then(res => setComments(res.data));
        },
        submitComment: () => {
            if (!commentContent.trim()) return;
            api.post("/api/comments", {
                postId: id,
                userId: user.user.id,
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
                postId: id,
                userId: user.user.id,
                content: replyContent,
                parentId
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
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const forceViewCount = searchParams.get('forceViewCount');
        const fetchPost = async () => {
            try {
                const response = forceViewCount
                    ? await api.get(`/api/posts/${id}?forceViewCount=true`)
                    : await api.get(`/api/posts/${id}`);

                setPost(response.data);
                if (forceViewCount) {
                    window.history.replaceState({}, '', `/community/${id}`);
                }
            } catch {
                alert('게시글을 불러오는 데 실패했습니다.');
                navigate('/community');
            }
        };
        fetchPost();
    }, [id, location.search, navigate]);

    useEffect(() => {
        commentHandlers.reloadComments();
        api.get(`/api/comments/post/${postId}/count`).then(res => setCommentCount(res.data));
    }, [id]);

    const sendReaction = async ({ userId, targetType, targetId, liked }) => {
        try {
            await api.post('/api/reactions', {
                userId,
                targetType,
                targetId,
                liked
            });

            if (targetType === 'POST') {
                const res = await api.get(`/api/posts/${targetId}`);
                setPost(res.data); // 게시글 갱신
            } else {
                commentHandlers.reloadComments();  // ✅ 이렇게 고쳐야 함!
            }
        } catch (err) {
            console.error("리액션 실패", err);
        }
    };

    if (!post) {
        return (
            <div>
                <div className='postheader'>
                    <button type='button' className='listbtn' onClick={() => navigate('/community')}>&lt; 목록</button>
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
                <button type='button' className='listbtn' onClick={() => navigate('/community')}>&lt; 목록</button>&nbsp;&nbsp;
                <button type='button' className='writebtn' onClick={() => navigate('/community/write')}>📝 글쓰기</button>
            </div>

            <div className='post-detail'>
                <div className='post-detail-content'>
                    <div className='post-detail-header'>
                        <h2 className='post-detail-title'>[{post.category}] {post.title}</h2>
                        <div className='post-detail-info'>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginLeft: '10px', marginRight: '5px' }}>[{post.tier || '일반'}] {post.name}</span>
                                <span className='post-createdAt'>({formatDate(post.createdAt)})</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ marginRight: '20px' }}>조회 {post.views}</span>
                                <span>좋아요 {post.likes}</span>
                            </div>
                        </div>
                    </div>
                    <div className='post-detail-body' dangerouslySetInnerHTML={{ __html: post.content }}></div>
                    <div className='post-detail-footer'>
                        <button className='likebtn' style={{ marginRight: '10px' }} onClick={() => sendReaction({
                            userId: user.user.id,
                            targetType: 'POST',
                            targetId: postId,
                            liked: true
                        })}>👍 좋아요({post.likes})</button>

                        <button className='dislikebtn' onClick={() => sendReaction({
                            userId: user.user.id,
                            targetType: 'POST',
                            targetId: postId,
                            liked: false
                        })}>👎 싫어요({post.dislikes})</button>
                    </div>
                </div>

                <div className='post-comments'>
                    <div className="comment-count">댓글 ({commentCount})</div>
                    <br />
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
                                            setReplyTargetId(null);
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