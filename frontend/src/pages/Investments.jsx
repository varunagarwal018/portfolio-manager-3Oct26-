import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Investments() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' }); // success | error

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  
  const [currentInvestment, setCurrentInvestment] = useState(null); // null means ADD mode, object means EDIT mode
  const [formData, setFormData] = useState({ type: 'Savings', name: '', amount: '', years: '', annual_return: '' });
  const [topUpAmount, setTopUpAmount] = useState('');

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/investments');
      setInvestments(res.data);
    } catch (err) {
      showMessage('Failed to load investments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleOpenAdd = () => {
    setCurrentInvestment(null);
    setFormData({ type: 'Savings', name: '', amount: '', years: '', annual_return: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (inv) => {
    setCurrentInvestment(inv);
    setFormData({ 
      type: inv.type, 
      name: inv.name, 
      amount: inv.amount, 
      years: inv.years, 
      annual_return: inv.annual_return 
    });
    setIsFormOpen(true);
  };

  const handleOpenTopUp = (inv) => {
    setCurrentInvestment(inv);
    setTopUpAmount('');
    setIsTopUpOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/investments/${id}`);
        showMessage('Investment deleted successfully', 'success');
        fetchInvestments();
      } catch (err) {
        showMessage('Failed to delete investment', 'error');
      }
    }
  };

  const validateForm = () => {
    const { name, amount, years, annual_return } = formData;
    if (!name.trim()) return 'Name is required';
    if (amount === '' || Number(amount) < 0) return 'Valid amount is required (>= 0)';
    if (years === '' || Number(years) < 0) return 'Valid years is required (>= 0)';
    if (annual_return === '') return 'Annual return is required';
    return null;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      showMessage(error, 'error');
      return;
    }

    try {
      if (currentInvestment) {
        // Edit
        await axios.put(`http://localhost:5000/api/investments/${currentInvestment.id}`, formData);
        showMessage('Investment updated successfully', 'success');
      } else {
        // Add
        await axios.post('http://localhost:5000/api/investments', formData);
        showMessage('Investment added successfully', 'success');
      }
      setIsFormOpen(false);
      fetchInvestments();
    } catch (err) {
      showMessage('Failed to save investment', 'error');
    }
  };

  const handleTopUpSubmit = async (e) => {
    e.preventDefault();
    if (topUpAmount === '' || Number(topUpAmount) <= 0) {
      showMessage('Enter a valid top-up amount (> 0)', 'error');
      return;
    }

    try {
      const newAmount = Number(currentInvestment.amount) + Number(topUpAmount);
      const updatedData = { ...currentInvestment, amount: newAmount };
      
      await axios.put(`http://localhost:5000/api/investments/${currentInvestment.id}`, updatedData);
      showMessage('Top-up successful', 'success');
      setIsTopUpOpen(false);
      fetchInvestments();
    } catch (err) {
      showMessage('Failed to process top-up', 'error');
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manage Investments</h1>
          <p className="text-slate-500">View, add, edit, and top-up your portfolio items.</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          + Add Investment
        </button>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading investments...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium text-right">Invested (₹)</th>
                  <th className="px-6 py-4 font-medium text-right">Years</th>
                  <th className="px-6 py-4 font-medium text-right">Return (%)</th>
                  <th className="px-6 py-4 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {investments.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                      No investments found. Add one to get started!
                    </td>
                  </tr>
                ) : (
                  investments.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-700">{inv.name}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">{inv.type}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">{Number(inv.amount).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-right">{inv.years}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-medium">{inv.annual_return}%</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleOpenTopUp(inv)} className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium transition-colors">
                            Top-up
                          </button>
                          <button onClick={() => handleOpenEdit(inv)} className="px-3 py-1 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 text-xs font-medium transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(inv.id)} className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-xs font-medium transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{currentInvestment ? 'Edit Investment' : 'Add Investment'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Savings">Savings</option>
                  <option value="FD">FD</option>
                  <option value="SIP">SIP</option>
                  <option value="Equity">Equity</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. HDFC Fixed Deposit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Invested Amount (₹)</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Years Invested</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.years}
                    onChange={(e) => setFormData({...formData, years: e.target.value})}
                    placeholder="e.g. 2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Annual Return (%)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.annual_return}
                    onChange={(e) => setFormData({...formData, annual_return: e.target.value})}
                    placeholder="e.g. 7.5"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Top-up Modal */}
      {isTopUpOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Add Money</h2>
              <button onClick={() => setIsTopUpOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <form onSubmit={handleTopUpSubmit} className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-4">Adding money to <strong>{currentInvestment?.name}</strong>.</p>
                <label className="block text-sm font-medium text-slate-700 mb-1">Top-up Amount (₹)</label>
                <input 
                  type="number" 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="0"
                  autoFocus
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsTopUpOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
