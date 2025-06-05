import React, { useEffect, useState } from 'react';
import { fetchTodayMarketIndex, fetchYesterdayMarketIndex } from '../../api/marketIndexApi';
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';

export default function MarketChart() {
    const [todayData, setTodayData] = useState([]);
    const [yesterdayData, setYesterdayData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const today = await fetchTodayMarketIndex();
            const yesterday = await fetchYesterdayMarketIndex();
            setTodayData(today);
            setYesterdayData(yesterday);
        };
        fetchData();
    }, []);

    // 평균 계산
    // const todayAvg =
    //     todayData.length > 0
    //         ? Math.round(todayData.reduce((acc, cur) => acc + cur.marketIndex, 0) / todayData.length)
    //         : 0;

    const yesterdayAvg =
        yesterdayData.length > 0
            ? Math.round(yesterdayData.reduce((acc, cur) => acc + cur.marketIndex, 0) / yesterdayData.length)
            : 0;

    const chartData = Array.from({ length: 24 }, (_, hour) => {
        const hourStr = String(hour).padStart(2, '0') + ':00'; // ← '00:00' 형식으로 변경
        const todayItem = todayData.find(d => d.hour === hourStr);
        const yesterdayItem = yesterdayData.find(d => d.hour === hourStr);
        const todayValue = todayItem?.marketIndex ?? null;
        const isAbove = todayValue !== null && todayValue >= yesterdayAvg;

        return {
            hour: hourStr,  // ← x축에 보여줄 라벨
            today: todayItem?.marketIndex ?? null,
            yesterday: yesterdayItem?.marketIndex ?? null,
            todayAbove: isAbove ? todayValue : null,
            todayBelow: !isAbove ? todayValue : null,
        };
    });

    // // 차트 데이터 출력용
    // useEffect(() => {
    //     console.log("🟢 todayData:", todayData);
    //     console.log("🟡 yesterdayData:", yesterdayData);
    // }, [todayData, yesterdayData]);

    const todayColor = chartData[0]?.todayAbove !== null ? '#E93E2A' : '#2979FF';

    return (

        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <ComposedChart data={chartData}>
                    <defs>
                        <linearGradient id="yesterdayGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#999" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#999" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="hour" hide />
                    <YAxis
                        hide
                        domain={['dataMin - 20', 'dataMax + 20']}  // << 이 부분이 핵심!
                        type="number"
                    />
                    <Tooltip
                        formatter={(value) => `${value} pt`}
                        labelFormatter={(label) => `시간: ${label}`}
                    />
                    <ReferenceLine y={yesterdayAvg} stroke="#888" strokeDasharray="3 3" />

                    {/*<Line*/}
                    {/*    type="monotone"*/}
                    {/*    dataKey="yesterday"*/}
                    {/*    stroke="#c8c8c8"*/}
                    {/*    strokeWidth={1}*/}
                    {/*    dot={false}*/}
                    {/*    isAnimationActive={false}*/}
                    {/*/>*/}
                    <Area
                        type="monotone"
                        dataKey="yesterday"
                        fill="url(#yesterdayGradient)"
                        stroke="none"
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="todayAbove"
                        stroke="#E93E2A"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                    />
                    <Line
                        type="monotone"
                        dataKey="todayBelow"
                        stroke="#2979FF"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        connectNulls
                    />
                </ComposedChart>
            </ResponsiveContainer>
            <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12 }}>
                <span style={{ color: todayColor }}>● Today</span> &nbsp;
                <span style={{ color: '#ccc' }}>● Yesterday</span>
            </div>
        </div>
    );
}