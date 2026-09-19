import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/portfolio/summary')
      .then(res => setData(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!data) return <div className="p-8">Loading dashboard...</div>;

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500">Welcome back, {user.name}!</p>
        </div>
        <Link to="/investments" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
          + Add Investment
        </Link>
      </div>

      <main className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Total Invested</h3>
            <p className="text-2xl font-bold mt-2 text-slate-800">₹{data.summary.totalInvested.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Current Value</h3>
            <p className="text-2xl font-bold mt-2 text-green-600">₹{data.summary.totalCurrentValue.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Total Gain</h3>
            <p className="text-2xl font-bold mt-2 text-emerald-500">+₹{data.summary.totalGain.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-slate-500 text-sm font-medium">Overall Return</h3>
            <p className="text-2xl font-bold mt-2 text-blue-600">{data.summary.overallReturnPercent}%</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Asset Allocation</h2>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.breakdown} dataKey="currentValue" nameKey="type" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5}>
                    {data.breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Invested vs Current Value</h2>
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.breakdown} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                  <Legend />
                  <Bar dataKey="totalInvested" name="Invested Amount" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="currentValue" name="Current Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 col-span-2">
            <h2 className="text-lg font-bold mb-4 text-slate-800">Investments</h2>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium text-right">Value</th>
                    <th className="pb-3 font-medium text-right">Return</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.investments.map(inv => (
                    <tr key={inv.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-700">{inv.name}</td>
                      <td className="py-3 text-slate-500">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">{inv.type}</span>
                      </td>
                      <td className="py-3 text-right font-medium">₹{inv.currentValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right text-emerald-600 font-medium">+{inv.returnPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
