import "../../styles/community/post.css";
import {useNavigate} from 'react-router-dom';
import api from "../../api/axiosConfig.js";
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
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [sortOrder, setSortOrder] = useState("latest");

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
        setCurrentPage(0);
        fetchPosts(0, category);
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
    const fetchPosts = async (page = 0, category = currentCategory, sort = sortOrder) => {
            try {
                const res = await api.get(`/api/posts/list`, {
                    params: {
                        page,
                        size: 10,
                        category: category === '전체' ? null : category,
                        sort : sort
                    }
                });
                setPosts(res.data.content);
                setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error('게시글 불러오기 실패:', err);
            }
        };
    useEffect(() => {
        fetchPosts(currentPage, currentCategory, sortOrder);
    }, [currentPage, currentCategory, sortOrder]); // 반드시 의존성 배열에 포함

    /**
     * 카테고리별 게시글 필터링
     */
    const filteredPosts = currentCategory === '전체'
        ? posts
        : posts.filter(post => post.category === currentCategory);

    const handleSortChange = (e) => {
        setSortOrder(e.target.value); // 변경만, fetchPosts는 useEffect가 감지해서 호출
    };

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
                            <select className="sort" onChange={handleSortChange} value={sortOrder}>
                                <option value="latest">최신순</option>
                                <option value="oldest">오래된순</option>
                                <option value="popular">인기순</option>
                                <option value="views">조회순</option>
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
                                    <span style={commentStyle}>[{post.commentCount}]</span>
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
                            {/* 이전 버튼 */}
                            <button
                                className="pagination-btn"
                                disabled={currentPage === 0}
                                onClick={() => setCurrentPage(currentPage - 1)}
                            >
                                &lt; 이전
                            </button>

                            {/* 페이지 번호들 */}
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(i)}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            {/* 다음 버튼 */}
                            <button
                                className="pagination-btn"
                                disabled={currentPage === totalPages - 1}
                                onClick={() => setCurrentPage(currentPage + 1)}
                            >
                                다음 &gt;
                            </button>
                        </td>
                    </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PostList;