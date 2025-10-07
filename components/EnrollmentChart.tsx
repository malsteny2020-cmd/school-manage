import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EnrollmentChartProps {
    data: { name: string; students: number }[];
}

const EnrollmentChart: React.FC<EnrollmentChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart
                data={data}
                margin={{
                    top: 5,
                    right: 20,
                    left: 0,
                    bottom: 5,
                }}
                layout="vertical"
            >
                <CartesianGrid stroke="#475569" strokeOpacity={0.3} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} tickLine={false} axisLine={false} stroke="#94a3b8" />
                <Tooltip 
                  cursor={{fill: '#38bdf8', fillOpacity: 0.1}}
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid #475569',
                    fontFamily: 'Cairo, sans-serif'
                  }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Legend wrapperStyle={{fontFamily: 'Cairo, sans-serif', color: '#94a3b8'}} />
                <Bar dataKey="students" name="عدد الطلاب" fill="#38bdf8" barSize={20} radius={[0, 5, 5, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default EnrollmentChart;