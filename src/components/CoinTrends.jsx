import React, { useState, useEffect } from 'react';
import { getMarketCodes, getTicker } from '../api/upbitApi';
import { fetchNews } from '../api/news';
import '../styles/CoinTrends.css';

const POPULAR_COINS = ['KRW-BTC', 'KRW-ETH', 'KRW-XRP', 'KRW-DOGE', 'KRW-SOL'];

const CoinTrends = () => {
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 코인 시세 데이터 가져오기
  useEffect(() => {
    const fetchMarketData = async () => {
      setLoading(true);
      try {
        const tickers = await getTicker(POPULAR_COINS);
        const formattedData = tickers.map(ticker => ({
          name: ticker.market,
          price: ticker.trade_price.toLocaleString(),
          change: ticker.signed_change_rate * 100,
          volume: ticker.acc_trade_volume_24h.toFixed(2)
        }));
        setMarketData(formattedData);
      } catch (err) {
        setError('시장 데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 5000);
    return () => clearInterval(interval);
  }, []);

  // 뉴스 데이터 가져오기
  useEffect(() => {
    const getNews = async () => {
      setLoading(true);
      try {
        const data = await fetchNews('비트코인', 1);
        setNewsData(data.newsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);

  if (loading) return <div className="loading">데이터 로딩 중...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="trends-container">
      <div className="trend-card bitcoin-analysis">
        <div className="card-header">
          <h3 className="card-title">비트코인 동향분석</h3>
        </div>
        <div className="card-content">
          {/* 비트코인 차트나 상세 정보가 들어갈 자리 */}
        </div>
      </div>

      <div className="trend-card high-volume">
        <div className="card-header">
          <h3 className="card-title">거래량 많은 종목</h3>
        </div>
        <div className="card-content">
          <ul className="coin-list">
            {marketData.slice(0, 3).map((coin, index) => (
              <li key={index} className="coin-item">
                <span className="coin-name">{coin.name}</span>
                <span className="coin-volume">{coin.volume}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="trend-card latest-news">
        <div className="card-header">
          <h3 className="card-title">최신 뉴스</h3>
        </div>
        <div className="card-content">
          <ul className="news-list">
            {newsData.slice(0, 3).map((news, index) => (
              <li key={index} className="news-item">
                <div 
                  className="news-title"
                  onClick={() => window.open(news.link, '_blank', 'noopener noreferrer')}
                >
                  {news.title}
                </div>
                <span className="news-date">{news.pubDate}</span>
              </li>
            ))}
          </ul>
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
              .slice(0, 3)
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
              .slice(0, 3)
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
        <div className="card-content">
          {/* 최근 상장 데이터가 들어갈 자리 */}
        </div>
      </div>

      <div className="trend-card caution-trading">
        <div className="card-header">
          <h3 className="card-title">거래유의 종목</h3>
        </div>
        <div className="card-content">
          {/* 거래유의 종목 데이터가 들어갈 자리 */}
        </div>
      </div>
    </div>
  );
};

export default CoinTrends; 