import React, { useEffect, useState } from 'react';
import axios from 'axios';
import api from "../api/axiosConfig.js";

const Ranking = () => {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(true);
    const seasonId = 1; // 테스트용으로 시즌 1 고정

    useEffect(() => {
        api.get(`http://localhost:8090/rankings/${seasonId}`)
            .then((response) => {
                setRankings(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('랭킹 데이터를 불러오지 못했습니다:', error);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>로딩 중...</div>;

    return (
        <div>
            <h2>시즌 {seasonId} 실시간 랭킹</h2>
            <table>
                <thead>
                <tr>
                    <th>실시간 랭킹</th>
                </tr>
                </thead>
                <tbody>
                {rankings.map((item) => (
                    <tr key={item.userId}>
                        <td>{item.ranks}</td>
                        <td>{item.userId}</td>
                        <td>{Number(item.totalValue).toLocaleString()} 원</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Ranking;
