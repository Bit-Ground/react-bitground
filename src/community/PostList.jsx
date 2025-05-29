import "./post.css";
import { useNavigate } from 'react-router-dom';
import api from "../api/axiosConfig.js";
import {useEffect, useState} from "react";

/**
 * 게시글 목록 페이지 컴포넌트
 * - 전체 게시글 목록 표시
 * - 카테고리별 필터링 기능
 * - 정렬 기능 (최신순, 오래된순, 인기순)
 * - 페이지네이션 지원
 */
const PostList = () => {
    const navigate = useNavigate();
    const [currentCategory, setCurrentCategory] = useState('전체');
    const [posts, setPosts] = useState([]);

    /**
     * 게시글 작성 페이지로 이동
     */
    const handleWrite = () => {
        navigate('/community/write');
    };

    /**
     * 게시글 상세 페이지로 이동
     * @param {number} postId - 게시글 ID
     */
    const handlePostClick = (postId) => {
        navigate(`/community/${postId}?forceViewCount=true`);
    };

    /**
     * 카테고리 필터 변경 처리
     * @param {string} category - 선택된 카테고리
     */
    const handleCategoryClick = (category) => {
        setCurrentCategory(category);
    };

    /**
     * 게시글 목록 스타일 설정
     */
    const tdStyle = {
        verticalAlign: 'middle',
        textAlign: 'center',
        height: '40px',
        lineHeight: '40px'
    };

    const titleStyle = {
        ...tdStyle,
        textAlign: 'left',
        cursor: 'pointer',
        maxWidth: '600px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
    };

    const commentStyle = {
        color: '#FC5754',
        marginLeft: '5px',
        fontSize: '0.9em'
    };

    const imageIconStyle = {
        marginLeft: '5px',
        color: '#666'
    };

    /**
     * 카테고리 버튼 스타일 설정
     * @param {string} category - 카테고리 이름
     * @returns {Object} 스타일 객체
     */
    const categoryButtonStyle = (category) => ({
        backgroundColor: currentCategory === category ? '#FC5754' : 'white',
        color: currentCategory === category ? 'white' : '#8C8C8C'
    });

    /**
     * 게시글 목록 데이터 불러오기
     * - 컴포넌트 마운트 시 실행
     * - API를 통해 게시글 목록을 가져옴
     */
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await api.get('/api/posts/list');
                setPosts(response.data);
            } catch (err) {
                console.log(err);
            }
        };
        fetchPosts();
    },[]);

    /**
     * 카테고리별 게시글 필터링
     */
    const filteredPosts = currentCategory === '전체'
        ? posts
        : posts.filter(post => post.category === currentCategory);

    /**
     * 게시글 등록일 포맷팅
     * @param {string} createdAt - ISO 형식의 날짜 문자열
     * @returns {string} 포맷팅된 날짜 문자열
     */
    const formatCreatedAt = (createdAt) => {
        if (!createdAt) return '';

        const postDate = new Date(createdAt);
        const now = new Date();

        const isToday = postDate.toDateString() === now.toDateString();

        if (isToday) {
            // 시간만 HH:MM
            const hours = postDate.getHours().toString().padStart(2, '0');
            const minutes = postDate.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } else {
            // 날짜 MM-DD
            const month = (postDate.getMonth() + 1).toString().padStart(2, '0');
            const date = postDate.getDate().toString().padStart(2, '0');
            return `${month}-${date}`;
        }
    };

    return (
        <div>
            {/* 상단 네비게이션 */}
            <div className='postheader'>
                <button type='button' className='listbtn'> &lt; 목록 </button>&nbsp;&nbsp;
                <button type='button' className='writebtn' onClick={handleWrite}> 📝 글쓰기</button>
            </div>
            <div className='postlist'>
                <table className='posttable'>
                    <colgroup>
                        <col style={{ width: '5%' }} />
                        <col style={{ width: '59%' }} />
                        <col style={{ width: '15%' }} />
                        <col style={{ width: '6%' }} />
                        <col style={{ width: '8%' }} />
                        <col style={{ width: '5%' }} />
                    </colgroup>
                    {/* 카테고리 필터 및 정렬 옵션 */}
                    <thead className='postbtns'>
                       <tr>
                            <th colSpan="6" style={{ textAlign: 'left' }}>
                            <div className="button-group">
                                <button 
                                    onClick={() => handleCategoryClick('전체')}
                                    style={categoryButtonStyle('전체')}
                                >전체</button>
                                <button 
                                    onClick={() => handleCategoryClick('CHAT')}
                                    style={categoryButtonStyle('CHAT')}
                                >잡담</button>
                                <button 
                                    onClick={() => handleCategoryClick('QUESTION')}
                                    style={categoryButtonStyle('QUESTION')}
                                >질문</button>
                                <button 
                                    onClick={() => handleCategoryClick('INFO')}
                                    style={categoryButtonStyle('INFO')}
                                >정보</button>
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
                        <tr style={{ height: '10px' }}>
                            <td colSpan="7">
                                <div style={{ height: '1px', backgroundColor: '#ccc' }}></div>
                            </td>
                        </tr>
                    </thead>
                    {/* 게시글 목록 테이블 */}
                    <tbody>
                        <tr>
                            <td style={tdStyle}>번호</td>
                            <td style={tdStyle}>제목</td>
                            <td style={tdStyle}>글쓴이</td>
                            <td style={tdStyle}>등록일</td>
                            <td style={tdStyle}>조회수</td>
                            <td style={tdStyle}>좋아요</td>
                            <td style={tdStyle}>싫어요</td>
                        </tr>
                        <tr style={{ height: '10px' }}>
                            <td colSpan="7">
                                <div style={{ height: '1px', backgroundColor: '#ccc' }} />
                            </td>
                        </tr>
                        {/* 필터링된 게시글 목록 */}
                        {filteredPosts.map(post => (
                            <tr key={post.id}>
                                <td style={tdStyle}>{post.id}</td>
                                <td style={titleStyle} onClick={() => handlePostClick(post.id)}>
                                    [{post.category}] {post.title}
                                    <span style={commentStyle}>[{post.comments}댓글 수]</span>
                                    {post.hasImage && <span style={imageIconStyle}>📷</span>}
                                </td>
                                <td style={tdStyle}>[티어{post.tier}]{post.name}</td>
                                <td style={tdStyle}>{formatCreatedAt(post.createdAt)}</td>
                                <td style={tdStyle}>{post.views}</td>
                                <td style={tdStyle}>{post.likes}</td>
                                <td style={tdStyle}>{post.dislikes}</td>
                            </tr>
                        ))}
                    </tbody>
                    {/* 페이지네이션 */}
                    <tfoot>
                        <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                                <button className="pagination-btn">&lt;이전</button>
                                <button className="pagination-btn active">1</button>
                                <button className="pagination-btn">2</button>
                                <button className="pagination-btn">3</button>
                                <button className="pagination-btn">다음&gt;</button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PostList;