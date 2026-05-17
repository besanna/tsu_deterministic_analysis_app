import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

export default function ResultCharts({ coordinates, capitals, width = "100%", height = 300 }) {
    return (
        <div className='my-12 w-full gap-6 flex flex-col'>
            {/* Area Chart */}
            <div style={{ flex: 1 }}>
                <p className='text-center text-xl font-bold text-gray-900/80 mb-4'>Прогнозируемый капитал</p>
                <ResponsiveContainer width={width} height={height}>
                    <AreaChart data={coordinates}>
                        <defs>
                            <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#8884d8" stopOpacity={1}/>
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="x" type="number" domain={['auto', 'auto']} tickFormatter={(tick) => Math.round(tick)} tickCount={10}/>
                        <YAxis dataKey="y" type="number" domain={[0, 1]} tickCount={10}/>
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip formatter={(x, y, props) => [`Вероятность: ${props.payload.y.toFixed(6)}`]} />
                        <Area type="monotone" dataKey="y" stroke="#8884d8" fill="url(#colorArea)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* <div style={{ flex: 1 }}>
                <h3 className="text-center text-lg font-semibold mb-4">Capital Distribution</h3>
                <ResponsiveContainer width={width} height={height}>
                    <BarChart data={capitalRangeData}>
                        <XAxis dataKey="range" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div> */}
        </div>
    );
}
