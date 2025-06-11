import React from 'react';
import {Area, CartesianGrid, ComposedChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import '../../styles/rank/DistributionChart.css';

export default function DistributionChart({userAssets, currentUserAsset}) {

    const currentUserAssetInM = currentUserAsset / 1000000;

    // 백분위 계산
    const calculatePercentile = (userAsset, allAssets) => {
        const higherCount = allAssets.filter(asset => asset > userAsset).length;
        const percentile = (higherCount / allAssets.length) * 100;
        return Math.round(percentile);
    };

    const userPercentile = calculatePercentile(currentUserAsset, userAssets);

    // 통계 계산
    const values = userAssets;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // 정규분포 확률밀도함수
    const normalPDF = (x, mu, sigma) => {
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    };

    // 완전히 부드러운 정규분포 곡선 데이터 생성
    const createSmoothDistribution = () => {
        const min = mean - 3 * stdDev; // 평균 ± 3σ 범위
        const max = mean + 3 * stdDev;
        const points = 2000; // 매우 높은 해상도
        const step = (max - min) / points;

        const distributionData = [];
        const densityValues = [];

        // 정규분포 곡선 생성
        for (let i = 0; i <= points; i++) {
            const x = min + i * step;
            const normalValue = normalPDF(x, mean, stdDev);
            densityValues.push(normalValue);
        }

        // 최대값으로 정규화하여 0~2.0 범위로 스케일링
        const maxDensity = Math.max(...densityValues);

        for (let i = 0; i <= points; i++) {
            const x = min + i * step;
            const xInMillions = x / 1000000;
            const normalizedDensity = (densityValues[i] / maxDensity) * 2.0;

            distributionData.push({
                value: parseFloat(xInMillions.toFixed(4)),
                kde: parseFloat(normalizedDensity.toFixed(4)),
                xValue: x
            });
        }

        return distributionData;
    };

    const smoothData = createSmoothDistribution();

    // x축 분위를 균등하게 계산하는 함수 (9개 정수, 5번째는 중앙값)
    const calculateXTicks = (data) => {
        // 곡선 데이터의 실제 x값 범위를 사용
        const values = data.map(d => d.value).sort((a, b) => a - b);
        const ticks = [];

        // 0%, 12.5%, 25%, 37.5%, 50%, 62.5%, 75%, 87.5%, 100% percentile
        const percentiles = [0, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];

        for (let i = 0; i < 9; i++) {
            const percentile = percentiles[i];
            let value;

            if (percentile === 0) {
                value = values[0]; // 최솟값
            } else if (percentile === 100) {
                value = values[values.length - 1]; // 최댓값
            } else {
                // percentile 계산
                const index = (percentile / 100) * (values.length - 1);
                const lower = Math.floor(index);
                const upper = Math.ceil(index);
                const weight = index - lower;

                if (lower === upper) {
                    value = values[lower];
                } else {
                    value = values[lower] * (1 - weight) + values[upper] * weight;
                }
            }

            ticks.push(Math.round(value));
        }

        // 음수 제거 - 0 이상인 값들만 필터링
        const positiveTicks = ticks.filter(tick => tick >= 0);

        // 중복 제거 및 정렬
        return [...new Set(positiveTicks)].sort((a, b) => a - b);
    };

    const xAxisTicks = calculateXTicks(smoothData);

    // 커스텀 툴팁
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const assetInWon = Math.round(parseFloat(label) * 1000000); // 백만원 단위를 원 단위로 변환

            return (
                <div className="custom-tooltip">
                    <p className="tooltip-asset-text">{`${assetInWon.toLocaleString()}원`}</p>
                    {Math.abs(parseFloat(label) - currentUserAssetInM) < 0.3 && (
                        <p className="user-position-text">
                            ← 내 위치 (상위 {userPercentile}%)
                        </p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="distribution-chart-container">
            {/* 확률 밀도 함수 차트만 */}
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={smoothData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                        dataKey="value"
                        type="number"
                        scale="linear"
                        domain={['dataMin', 'dataMax']}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => Math.round(value)}
                        ticks={xAxisTicks}
                        label={{ value: '자산 (백만)', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        domain={[0, 'dataMax + 0.2']}
                        label={{ value: '밀도', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    {/* 실제 데이터 기반 KDE 곡선 */}
                    <Area
                        type="monotone"
                        dataKey="kde"
                        stroke="#2563eb"
                        fill="url(#kdeGradient)"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        name="확률 밀도"
                        connectNulls={true}
                    />

                    {/* 사용자 자산 위치 표시 */}
                    <ReferenceLine
                        x={currentUserAssetInM}
                        stroke="#ef4444"
                        strokeWidth={3}
                        label={({ viewBox }) => {
                            const { x, y } = viewBox;
                            return (
                                <text
                                    x={x}
                                    y={y - 10}
                                    textAnchor="middle"
                                    fill="#ef4444"
                                    fontSize="12px"
                                >
                                    <tspan style={{ fontWeight: 500 }}>내 위치 (상위 {userPercentile}%)</tspan>
                                </text>
                            );
                        }}
                    />

                    <defs>
                        <linearGradient id="kdeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};