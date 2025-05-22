import React from 'react';
import "./post.css";
import { useNavigate } from 'react-router-dom';

const PostList = () => {
    const navigate = useNavigate();

    const handleWrite = () => {
        navigate('/community/write');
    };

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
        maxWidth: '600px',  // 제목이 너무 길 경우를 대비
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

    // 더미 데이터
    const dummyPosts = [
        {
            id: 1,
            title: '리액트 학습 로드맵 공유합니다',
            author: '개발왕',
            date: '2024-03-20',
            views: 128,
            likes: 15,
            category: '정보',
            comments: 8,
            hasImage: true
        },
        {
            id: 2,
            title: '프론트엔드 개발자 취업 후기',
            author: '취준생',
            date: '2024-03-19',
            views: 256,
            likes: 32,
            category: '잡담',
            comments: 15,
            hasImage: false
        },
        {
            id: 3,
            title: 'JavaScript 비동기 처리 질문있습니다',
            author: '초보개발자',
            date: '2024-03-19',
            views: 89,
            likes: 5,
            category: '질문',
            comments: 4,
            hasImage: true
        },
        {
            id: 4,
            title: '추천하는 개발 유튜브 채널',
            author: '테크리더',
            date: '2024-03-18',
            views: 432,
            likes: 45,
            category: '정보',
            comments: 23,
            hasImage: true
        },
        {
            id: 5,
            title: 'TypeScript 도입 후기',
            author: '타입마스터',
            date: '2024-03-18',
            views: 167,
            likes: 23,
            category: '잡담',
            comments: 12,
            hasImage: false
        },
        {
            id: 6,
            title: 'Next.js vs React',
            author: '프레임워크고수',
            date: '2024-03-17',
            views: 298,
            likes: 28,
            category: '정보',
            comments: 18,
            hasImage: false
        },
        {
            id: 7,
            title: 'CSS 레이아웃 질문드립니다',
            author: 'CSS초보',
            date: '2024-03-17',
            views: 76,
            likes: 3,
            category: '질문',
            comments: 6,
            hasImage: true
        },
        {
            id: 8,
            title: '개발자 번아웃 극복기',
            author: '치유중',
            date: '2024-03-16',
            views: 345,
            likes: 41,
            category: '잡담',
            comments: 28,
            hasImage: false
        }
    ];

    return (
        <div>
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
                            <td style={tdStyle}>번호</td>
                            <td style={tdStyle}>제목</td>
                            <td style={tdStyle}>글쓴이</td>
                            <td style={tdStyle}>등록일</td>
                            <td style={tdStyle}>조회수</td>
                            <td style={tdStyle}>추천수</td>
                        </tr>
                        <tr>
                            <td colSpan="6">
                                <div style={{ height: '1px', backgroundColor: '#ccc' }} />
                            </td>
                        </tr>
                        {dummyPosts.map(post => (
                            <tr key={post.id}>
                                <td style={tdStyle}>{post.id}</td>
                                <td style={titleStyle} onClick={() => navigate('/community/detail')}>
                                    [{post.category}] {post.title}
                                    <span style={commentStyle}>[{post.comments}]</span>
                                    {post.hasImage && <span style={imageIconStyle}>📷</span>}
                                </td>
                                <td style={tdStyle}>{post.author}</td>
                                <td style={tdStyle}>{post.date.slice(5)}</td>
                                <td style={tdStyle}>{post.views}</td>
                                <td style={tdStyle}>{post.likes}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                                <button className="pagination-btn">&lt;</button>
                                <button className="pagination-btn active">1</button>
                                <button className="pagination-btn">2</button>
                                <button className="pagination-btn">3</button>
                                <button className="pagination-btn">&gt;</button>
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};

export default PostList;