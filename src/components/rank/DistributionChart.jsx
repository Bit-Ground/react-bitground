import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import '../../style/distribution-chart.css';


const sampleChartData = [
    {
        id: '자산 분포',
        data: [
            { x: '0', y: 1 },
            { x: '100만', y: 4 },
            { x: '200만', y: 9 },
            { x: '300만', y: 15 },
            { x: '400만', y: 11 },
            { x: '500만', y: 6 },
            { x: '600만', y: 2 },
        ],
    }
];

// 내 자산 위치 (예: 430만원이면 '400만' 구간)
const myAssetLabel = '400만';

const DistributionChart = () => {
    return (
        <div className="distribution-wrapper">
            <div className="section-header">
                <div className="section-title">분포도</div>
            </div>
            <div className="chart-placeholder">
                <div className="chart-container">
                    <ResponsiveLine
                        data={sampleChartData}
                        margin={{ top: 40, right: 100, bottom: 60, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
                        axisBottom={{ legend: '자산 구간', legendOffset: 36, legendPosition: 'middle' }}
                        axisLeft={{ legend: '인원 수', legendOffset: -40, legendPosition: 'middle' }}
                        colors={{ scheme: 'nivo' }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                translateX: 100,
                                itemWidth: 80,
                                itemHeight: 20,
                                symbolShape: 'circle'
                            }
                        ]}
                        markers={[
                            {
                                axis: 'x',
                                value: myAssetLabel,
                                lineStyle: { stroke: '#FF6B6B', strokeWidth: 2 },
                                legend: '내 위치',
                                legendOffsetY: -20,
                                legendOrientation: 'vertical'
                            }
                        ]}
                    />
                </div>
            </div>
        </div>
    );
};

export default DistributionChart;
