import React, { useState, useEffect } from 'react';
import { fetchNews } from '../api/news'; // '../api/news' 경로에서 fetchNews 함수를 가져옵니다.
import '../styles/CoinTrends.css'; // 원래의 CSS 파일을 다시 사용합니다.

//  인기 코인 목록 (영문 키워드 추출을 위해 'KRW-' 접두사 포함)
const POPULAR_COINS = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-DOGE', 'KRW-SOL'];
// POPULAR_COINS에서 영문명만 추출한 목록 (뉴스 검색용)
const POPULAR_COIN_KEYWORDS = POPULAR_COINS.map(coin => coin.split('-')[1]);

const CoinTrends = () => {
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  // 기본 키워드를 'BTC' (영문)으로 설정
  const [keyword, setKeyword] = useState('BTC');
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [errorMarket, setErrorMarket] = useState(null);
  const [errorNews, setErrorNews] = useState(null);

  // 📊 코인 시세 데이터 가져오기
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoadingMarket(true);
      setErrorMarket(null);
      try {
        const marketsParam = POPULAR_COINS.join(',');
        const response = await fetch(`https://api.upbit.com/v1/ticker?markets=${marketsParam}`);
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Upbit API 호출 실패: 상태 코드 ${response.status}, 메시지: ${errorBody}`);
        }
        const tickers = await response.json();
        const formattedData = tickers.map(ticker => ({
          name: ticker.market,
          price: ticker.trade_price,
          change: ticker.signed_change_rate * 100,
          volume: ticker.acc_trade_volume_24h
        }));
        setMarketData(formattedData);
      } catch (err) {
        setErrorMarket('시장 데이터를 불러오는데 실패했습니다: ' + err.message);
        console.error("Upbit API 호출 오류:", err);
      } finally {
        setLoadingMarket(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  // 📰 뉴스 데이터 가져오기 (디바운스 + 빈 검색어 방지 + 영문 키워드 사용)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // keyword를 항상 영문으로 유지 (사용자가 한글 입력 시에도 영문으로 변환하거나, 입력 자체를 막는 로직 추가 가능)
      // 현재는 입력된 값을 그대로 사용하되, 드롭다운에서는 영문만 설정합니다.
      const englishKeyword = keyword.trim().toUpperCase(); // 입력값을 대문자로 변환 (선택 사항)

      if (!englishKeyword) {
        setNewsData([]); // 검색어가 비어있으면 뉴스 데이터도 비웁니다.
        return;
      }
      setLoadingNews(true);
      setErrorNews(null);
      try {
        // encodeURIComponent는 영문에도 안전하게 작동합니다.
        const data = await fetchNews(encodeURIComponent(englishKeyword), 1);
        setNewsData(data.newsData || []);
      } catch (err) {
        setErrorNews('뉴스 데이터를 불러오는데 실패했습니다: ' + err.message);
        console.error("뉴스 API 호출 오류:", err);
      } finally {
        setLoadingNews(false);
      }
    }, 500); // 디바운스 0.5초

    return () => clearTimeout(timer);
  }, [keyword]);

  // ✨ 드롭다운 선택 핸들러
  const handleDropdownChange = (e) => {
    const selectedValue = e.target.value;
    if (selectedValue) {
      // 선택된 'KRW-XXX'에서 'XXX' (영문 키워드)만 추출하여 설정
      setKeyword(selectedValue.split('-')[1]);
    }
  };


  // 시장 데이터 로딩 또는 에러는 최상단에서 처리합니다.
  if (loadingMarket) return <div className="loading">시장 데이터 로딩 중...</div>;
  if (errorMarket) return <div className="error">{errorMarket}</div>;

  return (
      <div className="trends-container">
        {/* ... (기존 비트코인 동향분석, 거래량 많은 종목 카드) ... */}
        <div className="trend-card bitcoin-analysis">
          <div className="card-header">
            <h3 className="card-title">비트코인 동향분석</h3>
          </div>
          <div className="card-content">
            <p>비트코인 차트가 여기에 표시됩니다.</p>
          </div>
        </div>

        <div className="trend-card high-volume">
          <div className="card-header">
            <h3 className="card-title">거래량 많은 종목</h3>
          </div>
          <div className="card-content">
            <ul className="coin-list">
              {marketData
                  .sort((a, b) => b.volume - a.volume)
                  .slice(0, 5)
                  .map((coin, index) => (
                      <li key={index} className="coin-item">
                        <span className="coin-name">{coin.name}</span>
                        <span className="coin-volume">
                    {Number(coin.volume).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                      </li>
                  ))}
            </ul>
          </div>
        </div>

        {/* 📰 최신 뉴스 (드롭다운 추가) */}
        <div className="trend-card latest-news">
          <div className="card-header">
            <h3 className="card-title">최신 뉴스</h3>
            {/* 검색 컨트롤들을 묶는 div 추가 */}
            <div className="news-search-controls">
              {/* 인기 코인 드롭다운 */}
              <select onChange={handleDropdownChange} className="popular-coin-select">
                <option value="">인기 코인 선택</option>
                {POPULAR_COINS.map(coin => (
                    <option key={coin} value={coin}>
                      {coin} {/* 드롭다운에는 'KRW-BTC' 형식으로 표시 */}
                    </option>
                ))}
              </select>
              {/* 검색 입력창 */}
              <input
                  type="text"
                  value={keyword} // 이제 keyword는 'BTC', 'ETH' 등 영문
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="영문 코인명 검색 (예: BTC)" // 플레이스홀더 변경
                  className="news-search-input"
              />
            </div>
          </div>
          <div className="card-content">
            {loadingNews ? (
                <div className="loading">뉴스 로딩 중...</div>
            ) : errorNews ? (
                <div className="error">{errorNews}</div>
            ) : newsData.length > 0 ? (
                <ul className="news-list">
                  {newsData.slice(0, 5).map((news, index) => (
                      <li key={index} className="news-item">
                        <div
                            className="news-title"
                            onClick={() => window.open(news.link, '_blank', 'noopener noreferrer')}
                        >
                          <span dangerouslySetInnerHTML={{ __html: news.title }} />
                        </div>
                        <span className="news-date">{news.pubDate}</span>
                      </li>
                  ))}
                </ul>
            ) : (
                <div className="no-results">검색 결과가 없습니다.</div>
            )}
          </div>
        </div>

        {/* ... (기존 상승폭, 하락폭, 최근 상장, 거래유의 종목 카드) ... */}
        <div className="trend-card price-increase">
          <div className="card-header">
            <h3 className="card-title">상승폭 큰 종목</h3>
          </div>
          <div className="card-content">
            <ul className="coin-list">
              {marketData
                  .filter(coin => coin.change > 0)
                  .sort((a, b) => b.change - a.change)
                  .slice(0, 5)
                  .map((coin, index) => (
                      <li key={index} className="coin-item">
                        <span className="coin-name">{coin.name}</span>
                        <span className="coin-change positive">+{coin.change.toFixed(2)}%</span>
                      </li>
                  ))}
            </ul>
          </div>
        </div>

        <div className="trend-card price-decrease">
          <div className="card-header">
            <h3 className="card-title">하락폭 큰 종목</h3>
          </div>
          <div className="card-content">
            <ul className="coin-list">
              {marketData
                  .filter(coin => coin.change < 0)
                  .sort((a, b) => a.change - b.change)
                  .slice(0, 5)
                  .map((coin, index) => (
                      <li key={index} className="coin-item">
                        <span className="coin-name">{coin.name}</span>
                        <span className="coin-change negative">{coin.change.toFixed(2)}%</span>
                      </li>
                  ))}
            </ul>
          </div>
        </div>

        <div className="trend-card recent-listing">
          <div className="card-header">
            <h3 className="card-title">최근 상장</h3>
          </div>
          <div className="card-content">{/* 최근 상장 데이터 */}</div>
        </div>

        <div className="trend-card caution-trading">
          <div className="card-header">
            <h3 className="card-title">거래유의 종목</h3>
          </div>
          <div className="card-content">{/* 거래유의 종목 데이터 */}</div>
        </div>
      </div>
  );
};

export default CoinTrends;