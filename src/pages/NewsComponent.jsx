import React, { useState, useEffect } from 'react';
import { getNews } from '../api/news.js';

const NewsComponent = () => {
    const [query, setQuery] = useState('비트코인');
    const [newsData, setNewsData] = useState([]);
    const [pageNum, setPageNum] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getNews = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getNews(query, pageNum);
                setNewsData(data.newsData);``
                setTotalPage(data.totalPage);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        getNews();
    }, [query, pageNum]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPageNum(1); // 검색 시 페이지 초기화
    };

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSearch} className="mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="코인 이름 입력 (예: 비트코인)"
                    className="border p-2 mr-2 rounded"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    검색
                </button>
            </form>

            {loading && <p>로딩 중...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && newsData.length === 0 && <p>뉴스 데이터가 없습니다.</p>}

            <ul className="space-y-4">
                {newsData.map((news, index) => (
                    <li key={index} className="border p-4 rounded">
                        <a
                            href={news.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                        >
                            {news.title}
                        </a>
                        <p>{news.description}</p>
                        <p className="text-gray-500">{news.pubDate}</p>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex justify-center space-x-2">
                <button
                    onClick={() => setPageNum(pageNum - 1)}
                    disabled={pageNum === 1}
                    className="p-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    이전
                </button>
                <span>
          {pageNum} / {totalPage}
        </span>
                <button
                    onClick={() => setPageNum(pageNum + 1)}
                    disabled={pageNum === totalPage}
                    className="p-2 bg-gray-200 rounded disabled:opacity-50"
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default NewsComponent;