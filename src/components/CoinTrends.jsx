import React, { useState, useEffect } from 'react';
import { fetchNews } from '../api/news'; // '../api/news' 경로에서 fetchNews 함수를 가져옵니다.
import '../styles/CoinTrends.css'; // 원래의 CSS 파일을 다시 사용합니다.

// 인기 코인 목록 (영문 키워드 추출을 위해 'KRW-' 접두사 포함)
const POPULAR_COINS = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-DOGE', 'KRW-SOL'];
// POPULAR_COINS에서 영문명만 추출한 목록 (뉴스 검색용)
const POPULAR_COIN_KEYWORDS = POPULAR_COINS.map(coin => coin.split('-')[1]);

const CoinTrends = () => {
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [cautionCoins, setCautionCoins] = useState([]); // 유의 종목 (market_event.warning)
  const [alertCoins, setAlertCoins] = useState([]);     // 주의 종목 (market_event.caution)
  const [keyword, setKeyword] = useState('BTC');

  const [loadingMarket, setLoadingMarket] = useState(true); // 초기값을 true로 설정
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingCaution, setLoadingCaution] = useState(true); // 유의 종목 로딩 상태 (초기값을 true로 설정)
  const [loadingAlert, setLoadingAlert] = useState(true);     // 주의 종목 로딩 상태 (초기값을 true로 설정)

  const [errorMarket, setErrorMarket] = useState(null);
  const [errorNews, setErrorNews] = useState(null);
  const [errorCaution, setErrorCaution] = useState(null);     // 유의 종목 에러 상태
  const [errorAlert, setErrorAlert] = useState(null);         // 주의 종목 에러 상태


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

  // ⚠️ 거래유의 및 🔔 투자주의 종목 데이터
  useEffect(() => {
    const fetchCautionAndAlertData = async () => {
      setLoadingCaution(true);
      setLoadingAlert(true);
      setErrorCaution(null);
      setErrorAlert(null);

      try {
        const response = await fetch('https://api.upbit.com/v1/market/all?isDetails=true');
        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Upbit Market API 호출 실패: ${response.status}, 메시지: ${errorBody}`);
        }
        const allMarkets = await response.json();
        console.log("Upbit Market API 응답 (allMarkets):", allMarkets); // 원본 데이터 확인용 로그

        // 헬퍼 함수: market_event.caution 객체 내에 어떤 값이든 true인지 확인
        const hasAnyCautionFlag = (cautionObject) => {
          if (!cautionObject) return false;
          for (const key in cautionObject) {
            if (typeof cautionObject[key] === 'boolean' && cautionObject[key] === true) {
              return true;
            }
          }
          return false;
        };

        // '유의 종목' 필터링 (market_event.warning === true)
        // KRW 마켓만 대상으로 하며, 현재 예시 데이터에 따라 KRW-BTC의 DEPOSIT_AMOUNT_SOARING은 주의이므로,
        // 정확히 '유의' 배지를 나타내는 `market_event.warning`만 필터링합니다.
        const filteredCautionCoins = allMarkets
            .filter(market => market.market_event && market.market_event.warning === true && market.market.startsWith('KRW-'))
            .map(market => ({
              name: market.market,
              korean_name: market.korean_name,
            }));
        setCautionCoins(filteredCautionCoins);
        console.log("필터링된 유의 종목 (cautionCoins):", filteredCautionCoins);

        // '주의 종목' 필터링 (market_event.caution 내 플래그 중 하나라도 true)
        // '유의 종목'이 아닌 것 중에서 '주의' 종목을 찾도록 조건 추가하여 중복을 방지합니다.
        // 또한, KRW 마켓만 대상으로 합니다.
        const filteredAlertCoins = allMarkets
            .filter(market =>
                market.market_event &&
                market.market_event.warning === false && // 유의 종목이 아니면서
                hasAnyCautionFlag(market.market_event.caution) && // 주의 플래그가 하나라도 true
                market.market.startsWith('KRW-')
            )
            .map(market => ({
              name: market.market,
              korean_name: market.korean_name,
            }));
        setAlertCoins(filteredAlertCoins);
        console.log("필터링된 주의 종목 (alertCoins):", filteredAlertCoins);

      } catch (err) {
        setErrorCaution('거래유의 종목 데이터를 불러오는데 실패했습니다: ' + err.message);
        setErrorAlert('투자주의 종목 데이터를 불러오는데 실패했습니다: ' + err.message);
        console.error("Upbit Market API 오류:", err);
      } finally {
        setLoadingCaution(false);
        setLoadingAlert(false);
      }
    };

    fetchCautionAndAlertData();
    // 거래유의/주의 정보는 시세처럼 자주 바뀌지 않으므로, 마운트 시 한 번만 호출하거나 긴 주기로 호출할 수 있습니다.
  }, []);

  // 📰 뉴스 데이터 가져오기 (디바운스 + 빈 검색어 방지 + 영문 키워드 사용)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const englishKeyword = keyword.trim().toUpperCase();

      if (!englishKeyword) {
        setNewsData([]); // 검색어가 비어있으면 뉴스 데이터도 비웁니다.
        return;
      }
      setLoadingNews(true);
      setErrorNews(null);
      try {
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

  return (
      <div className="trends-container">
        {/* 시장 데이터 로딩 또는 에러 메시지 (컨텐츠 상단에 표시) */}
        {loadingMarket && <div className="loading">시장 데이터 로딩 중...</div>}
        {errorMarket && <div className="error">{errorMarket}</div>}

        {/* 시장 데이터가 로드되고 에러가 없을 때만 나머지 컨텐츠를 렌더링 */}
        {!loadingMarket && !errorMarket && (
            <>
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
                  <div className="news-search-controls">
                    <select onChange={handleDropdownChange} className="popular-coin-select">
                      <option value="">인기 코인 선택</option>
                      {POPULAR_COINS.map(coin => (
                          <option key={coin} value={coin}>
                            {coin}
                          </option>
                      ))}
                    </select>
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="영문 코인명 검색 (예: BTC)"
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

              {/* ⚠️ 거래유의 종목 */}
              <div className="trend-card caution-trading">
                <div className="card-header">
                  <h3 className="card-title">거래유의 종목</h3>
                </div>
                <div className="card-content">
                  {loadingCaution ? (
                      <div className="loading">로딩 중...</div>
                  ) : errorCaution ? (
                      <div className="error">{errorCaution}</div>
                  ) : cautionCoins.length > 0 ? (
                      <ul className="coin-list">
                        {cautionCoins.slice(0, 5).map((coin, index) => ( // 5개까지 표시
                            <li key={index} className="coin-item">
                              <span className="coin-name">{coin.korean_name} ({coin.name})</span>
                              <span className="coin-warning">⚠️ 유의</span>
                            </li>
                        ))}
                      </ul>
                  ) : (
                      <div className="no-results">현재 거래유의 종목이 없습니다.</div>
                  )}
                </div>
              </div>

              {/* 🔔 투자주의 종목 (새로 추가) */}
              <div className="trend-card alert-trading">
                <div className="card-header">
                  <h3 className="card-title">투자주의 종목</h3>
                </div>
                <div className="card-content">
                  {loadingAlert ? (
                      <div className="loading">로딩 중...</div>
                  ) : errorAlert ? (
                      <div className="error">{errorAlert}</div>
                  ) : alertCoins.length > 0 ? (
                      <ul className="coin-list">
                        {alertCoins.slice(0, 4).map((coin, index) => (
                            <li key={index} className="coin-item">
                              <span className="coin-name">{coin.korean_name} ({coin.name})</span>
                              <span className="coin-warning">🔔 주의</span>
                            </li>
                        ))}
                      </ul>
                  ) : (
                      <div className="no-results">현재 투자주의 종목이 없습니다.</div>
                  )}
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
            </>
        )}
      </div>
  );
};

export default CoinTrends;