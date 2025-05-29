// src/components/CoinTrends/CoinTrends.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchNews } from '../api/news'; // '../api/news' 경로 유지
import '../styles/CoinTrends.css'; // 새로운 CSS 파일 임포트

import {
  fetchTop5HighTradePriceCoins,
  fetchTop5PriceIncreaseCoins,
  fetchTop5PriceDecreaseCoins,
  fetchWarningCoins,
  fetchAlertCoins,
  fetchCoinSymbols, // AI 분석용 코인 심볼 가져오기
  fetchCoinInsight // AI 분석 내용 가져오기
} from '../api/coinService.js';

const POPULAR_COINS = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-DOGE', 'KRW-SOL'];
const POPULAR_COIN_KEYWORDS = POPULAR_COINS.map(coin => coin.split('-')[1]);

const CoinTrends = () => {
  const [marketData, setMarketData] = useState({
    highTradePrice: [],
    priceIncrease: [],
    priceDecrease: [],
    warningCoins: [], // 사용자 원본에 따라 유지
    alertCoins: [],   // 사용자 원본에 따라 유지
  });
  const [newsData, setNewsData] = useState([]);
  const [keyword, setKeyword] = useState('BTC');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNewsPages, setTotalNewsPages] = useState(1);

  const [loadingMarket, setLoadingMarket] = useState(true);
  const [loadingNews, setLoadingNews] = useState(false);

  // AI 분석 관련 상태 (사용자 원본 파일에서 이미 존재)
  const [coinSymbols, setCoinSymbols] = useState([]);
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState('');
  const [coinAnalysis, setCoinAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const newsCardRef = useRef(null);

  // 모든 코인 심볼 가져오기 (AI 분석 드롭다운용) - 사용자 원본 파일과 동일
  useEffect(() => {
    const getCoinSymbols = async () => {
      try {
        const symbols = await fetchCoinSymbols();
        setCoinSymbols(symbols);
        if (symbols.length > 0) {
          // 'KRW-BTC'를 기본 선택으로 설정 (원화 마켓 심볼)
          // 만약 'KRW-BTC'가 목록에 없으면 첫 번째 코인을 기본 선택
          const defaultCoin = symbols.find(s => s.symbol === 'KRW-BTC');
          setSelectedCoinSymbol(defaultCoin ? defaultCoin.symbol : symbols[0].symbol);
        }
      } catch (error) {
        console.error("Error fetching coin symbols:", error);
      }
    };
    getCoinSymbols();
  }, []);

  // 마켓 데이터 (거래대금, 상승/하락폭, 유의/주의 종목) 가져오기 - 사용자 원본 파일과 동일
  useEffect(() => {
    const getMarketData = async () => {
      setLoadingMarket(true);
      try {
        const [highTradePrice, priceIncrease, priceDecrease, warningCoins, alertCoins] = await Promise.all([
          fetchTop5HighTradePriceCoins(),
          fetchTop5PriceIncreaseCoins(),
          fetchTop5PriceDecreaseCoins(),
          fetchWarningCoins(),
          fetchAlertCoins(),
        ]);
        setMarketData({ highTradePrice, priceIncrease, priceDecrease, warningCoins, alertCoins });
      } catch (error) {
        console.error("Error fetching market data:", error);
        setMarketData({
          highTradePrice: [],
          priceIncrease: [],
          priceDecrease: [],
          warningCoins: [],
          alertCoins: [],
        });
      } finally {
        setLoadingMarket(false);
      }
    };
    getMarketData();

    // 1분마다 데이터 갱신
    const interval = setInterval(getMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  // 뉴스 데이터 가져오기 (키워드 또는 페이지 변경 시) - 사용자 원본 파일과 동일
  useEffect(() => {
    const getNews = async () => {
      setLoadingNews(true);
      try {
        // fetchNews의 display 기본값이 4로 설정되어 있으므로, 4개씩 가져옴
        const newsResponse = await fetchNews(keyword, currentPage);
        setNewsData(newsResponse.newsData);
        setTotalNewsPages(newsResponse.totalPage);
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsData([]);
        setTotalNewsPages(1);
      } finally {
        setLoadingNews(false);
        if (newsCardRef.current) {
          newsCardRef.current.scrollTop = 0;
        }
      }
    };
    if (keyword) {
      getNews();
    }
  }, [keyword, currentPage]);

  // AI 분석 관련 useEffect (선택된 코인 심볼 변경 시) - 사용자 원본 파일과 동일
  useEffect(() => {
    const getCoinInsight = async () => {
      if (!selectedCoinSymbol) {
        setCoinAnalysis(null);
        return;
      }
      setLoadingAnalysis(true);
      try {
        // DB와 연동하여 실제 데이터를 가져옵니다.
        const insight = await fetchCoinInsight(selectedCoinSymbol);
        setCoinAnalysis(insight);
      } catch (error) {
        console.error(`Error fetching AI insight for ${selectedCoinSymbol}:`, error);
        setCoinAnalysis(null);
      } finally {
        setLoadingAnalysis(false);
      }
    };
    getCoinInsight();
  }, [selectedCoinSymbol]); // selectedCoinSymbol이 변경될 때마다 호출

  const handleKeywordChange = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handlePopularCoinSelect = (e) => {
    setKeyword(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalNewsPages) {
      setCurrentPage(newPage);
    }
  };

  const handleCoinSelectForAnalysis = (e) => {
    setSelectedCoinSymbol(e.target.value);
  };

  return (
      <div className="trends-container">
        {/* 로딩 인디케이터 */}
        {(loadingMarket || loadingNews || loadingAnalysis) && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>데이터를 불러오는 중...</p>
            </div>
        )}

        {/* -------------------- 첫 번째 줄 -------------------- */}

        {/* === AI 분석 카드 (bitcoin-analysis 클래스 사용) === */}
        <div className="trend-card bitcoin-analysis">
          <div className="card-header">
            <h3 className="card-title">AI 코인 분석</h3>
            <div className="coin-select-wrapper">
              <select
                  className="popular-coin-select" // CSS에서 재사용
                  value={selectedCoinSymbol}
                  onChange={handleCoinSelectForAnalysis}
                  disabled={loadingAnalysis || coinSymbols.length === 0}
              >
                {coinSymbols.length === 0 ? (
                    <option value="">코인 불러오는 중...</option>
                ) : (
                    coinSymbols.map((coinDto) => (
                        <option key={coinDto.symbol} value={coinDto.symbol}>
                          {coinDto.koreanName} ({coinDto.symbol.replace('KRW-', '')})
                        </option>
                    ))
                )}
              </select>
            </div>
          </div>
          <div className="card-content">
            {loadingAnalysis ? (
                <div className="analysis-loading">AI가 분석 중입니다...</div>
            ) : coinAnalysis ? (
                <div className="ai-analysis-results">
                  {/* AI 분석 내용은 fetchCoinInsight 결과로 표시 */}
                  <p className="analysis-text">{coinAnalysis.insight}</p>
                  <div className="analysis-meta">
                <span className={`analysis-score ${coinAnalysis.score >= 0 ? 'positive' : 'negative'}`}>
                  점수: {coinAnalysis.score}
                </span>
                    <span className="analysis-date">
                  분석일: {new Date(coinAnalysis.date).toLocaleDateString('ko-KR')}
                </span>
                  </div>
                </div>
            ) : (
                <div className="no-results">선택된 코인에 대한 AI 분석이 없습니다.</div>
            )}
          </div>
        </div>

        {/* === 거래대금 TOP 5 (high-volume 클래스 사용) === */}
        <div className="trend-card high-volume">
          <div className="card-header">
            <h3 className="card-title">거래대금 TOP 5</h3>
          </div>
          <div className="card-content">
            {loadingMarket ? (
                <div className="loading-text">데이터 불러오는 중...</div>
            ) : marketData.highTradePrice.length > 0 ? (
                <ul className="coin-list">
                  {marketData.highTradePrice.map((coin, index) => (
                      <li key={index} className="coin-item">
                        <span className="coin-name">{coin.koreanName} <span className="coin-symbol">({coin.symbol})</span></span>
                        <span className="coin-value">{new Intl.NumberFormat('ko-KR').format(coin.tradePrice24h)}원</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <div className="no-results">데이터가 없습니다.</div>
            )}
          </div>
        </div>

        {/* -------------------- 두 번째 줄 -------------------- */}

        {/* === 최신 뉴스 (latest-news 클래스 사용) === */}
        <div className="trend-card latest-news">
          <div className="card-header">
            <h3 className="card-title">최신 뉴스</h3>
            <div className="news-search-controls">
              <input
                  type="text"
                  placeholder="뉴스 검색 키워드"
                  className="news-search-input"
                  value={keyword}
                  onChange={handleKeywordChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCurrentPage(1);
                    }
                  }}
              />
              <select
                  className="popular-coin-select"
                  value={keyword}
                  onChange={handlePopularCoinSelect}
              >
                {POPULAR_COIN_KEYWORDS.map((kw) => (
                    <option key={kw} value={kw}>{kw}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="card-content" ref={newsCardRef}>
            {loadingNews ? (
                <div className="loading-text">뉴스 불러오는 중...</div>
            ) : newsData.length > 0 ? (
                <ul className="news-list">
                  {newsData.map((news, index) => (
                      <li key={index} className="news-item">
                        <a href={news.link} target="_blank" rel="noopener noreferrer" className="news-title" dangerouslySetInnerHTML={{ __html: news.title }}></a>
                        {/* description은 CSS로 제한하므로 직접 넣기 */}
                        <span className="news-date">{new Date(news.pubDate).toLocaleDateString('ko-KR')}</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <div className="no-results">검색된 뉴스가 없습니다.</div>
            )}
          </div>
          <div className="news-pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>이전</button>
            <span>{currentPage} / {totalNewsPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalNewsPages}>다음</button>
          </div>
        </div>

        {/* === 상승폭 큰 종목 (price-increase 클래스 사용) === */}
        <div className="trend-card price-increase">
          <div className="card-header">
            <h3 className="card-title">상승폭 큰 종목</h3>
          </div>
          <div className="card-content">
            {loadingMarket ? (
                <div className="loading-text">데이터 불러오는 중...</div>
            ) : marketData.priceIncrease.length > 0 ? (
                <ul className="coin-list">
                  {marketData.priceIncrease.map((coin, index) => (
                      <li key={index} className="coin-item">
                        <span className="coin-name">{coin.koreanName} <span className="coin-symbol">({coin.symbol})</span></span>
                        <span className="coin-value positive">+{coin.changeRate.toFixed(2)}%</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <div className="no-results">데이터가 없습니다.</div>
            )}
          </div>
        </div>

        {/* -------------------- 세 번째 줄 -------------------- */}

        {/* === 거래유의 종목 (caution-trading 클래스 사용) === */}
        <div className="trend-card caution-trading">
          <div className="card-header">
            <h3 className="card-title">거래유의 종목</h3>
          </div>
          <div className="card-content">
            {loadingMarket ? (
                <div className="loading-text">데이터 불러오는 중...</div>
            ) : marketData.warningCoins.length > 0 ? (
                <ul className="coin-list">
                  {marketData.warningCoins.map((coin, index) => (
                      <li key={index} className="coin-item">
                        <span className="coin-name">{coin.koreanName} <span className="coin-symbol">({coin.symbol})</span></span>
                        <span className="coin-warning">🚨 유의</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <div className="no-results">현재 거래유의 종목이 없습니다.</div>
            )}
          </div>
        </div>

        {/* === 투자주의 종목 (alert-trading 클래스 사용) === */}
        <div className="trend-card alert-trading">
          <div className="card-header">
            <h3 className="card-title">투자주의 종목</h3>
          </div>
          <div className="card-content">
            {loadingMarket ? (
                <div className="loading-text">데이터 불러오는 중...</div>
            ) : marketData.alertCoins.length > 0 ? (
                <ul className="coin-list">
                  {marketData.alertCoins.map((coin, index) => (
                      <li key={index} className="coin-item">
                        <span className="coin-name">{coin.koreanName} <span className="coin-symbol">({coin.symbol})</span></span>
                        <span className="coin-warning">⚠️ 주의</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <div className="no-results">현재 투자주의 종목이 없습니다.</div>
            )}
          </div>
        </div>

        {/* === 하락폭 큰 종목 (price-decrease 클래스 사용) === */}
        <div className="trend-card price-decrease">
          <div className="card-header">
            <h3 className="card-title">하락폭 큰 종목</h3>
          </div>
          <div className="card-content">
            {loadingMarket ? (
                <div className="loading-text">데이터 불러오는 중...</div>
            ) : marketData.priceDecrease.length > 0 ? (
                <ul className="coin-list">
                  {marketData.priceDecrease.map((coin, index) => (
                      <li key={index} className="coin-item">
                        <span className="coin-name">{coin.koreanName} <span className="coin-symbol">({coin.symbol})</span></span>
                        <span className="coin-value negative">{coin.changeRate.toFixed(2)}%</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <div className="no-results">데이터가 없습니다.</div>
            )}
          </div>
        </div>
      </div>
  );
};

export default CoinTrends;