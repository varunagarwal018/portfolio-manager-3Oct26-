import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-800">Portfolio Manager</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`
          }
          end
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/investments" 
          className={({ isActive }) => 
            `block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`
          }
        >
          Investments
        </NavLink>
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="mb-4">
          <p className="text-xs text-slate-500">Logged in as</p>
          <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
        </div>
        <button 
          onClick={logout} 
          className="w-full text-left text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
