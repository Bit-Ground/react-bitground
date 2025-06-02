import React from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
    Area, Legend, ResponsiveContainer
} from 'recharts';

const data = [
    { time: '00:00', today: 20500, yesterday: 20000 },
    { time: '01:00', today: 20800, yesterday: 20200 },
    { time: '02:00', today: 21000, yesterday: 20400 },
    { time: '03:00', today: 20700, yesterday: 20600 },
    { time: '04:00', today: 20600, yesterday: 20800 },
    { time: '05:00', today: 20300, yesterday: 21000 },
    { time: '06:00', today: 20400, yesterday: 21200 },
    { time: '07:00', today: 20500, yesterday: 21500 },
    { time: '08:00', today: 20600, yesterday: 21600 },
    { time: '09:00', today: 20700, yesterday: 21700 },
    { time: '10:00', today: 20800, yesterday: 21900 },
    { time: '11:00', today: 20900, yesterday: 22000 },
    { time: '12:00', today: 21000, yesterday: 22100 },
    { time: '13:00', today: 21100, yesterday: 22200 },
    { time: '14:00', yesterday: 22300 },
    { time: '15:00', yesterday: 22400 },
    { time: '16:00', yesterday: 22500 },
    { time: '17:00', yesterday: 22600 },
    { time: '18:00', yesterday: 22700 },
    { time: '19:00', yesterday: 22800 },
    { time: '20:00', yesterday: 22900 },
    { time: '21:00', yesterday: 23000 },
    { time: '22:00', yesterday: 23100 },
    { time: '23:00', yesterday: 23200 },
];

const GbIndexChart = () => {
    const yesterdayValues = data.map(d => d.yesterday).filter(v => v !== undefined);
    const avg = yesterdayValues.reduce((sum, val) => sum + val, 0) / yesterdayValues.length;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <defs>
                        <linearGradient id="yesterdayGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#c8c8c8" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#c8c8c8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} horizontal={true} strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis hide />
                    <Tooltip
                        content={({ active, payload }) =>
                            active && payload?.[0]?.payload?.today ? (
                                <div style={{ background: '#fff', border: '1px solid #ccc', padding: '5px' }}>
                                    Today: {payload[0].payload.today}
                                </div>
                            ) : null
                        }
                    />
                    <Legend
                        payload={[
                            {
                                value: 'Today',
                                type: 'line',
                                id: 'Today',
                                color: '#000',
                                stroke: '#000',
                                strokeDasharray: '',
                            },
                            {
                                value: 'Yesterday',
                                type: 'line',
                                id: 'Yesterday',
                                color: '#c8c8c8',
                                stroke: '#c8c8c8',
                                strokeDasharray: '',
                            },
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="yesterday"
                        stroke="#c8c8c8"
                        fill="url(#yesterdayGradient)"
                        isAnimationActive={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="today"
                        stroke="#0000ff"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                    <ReferenceLine y={avg} stroke="#999" strokeDasharray="3 3" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GbIndexChart;