import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';

// Komponen Pembantu untuk Navigasi dengan Indikator Aktif
function NavLink({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-[13px] transition-all ${
        isActive 
          ? 'bg-blue-50 text-blue-900 shadow-sm border border-blue-100' 
          : 'text-slate-500 hover:text-blue-900 hover:bg-slate-50 border border-transparent'
      }`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </Link>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-slate-200 font-sans text-slate-900">
      
      {/* Navbar Global (Tema Terang) */}
      <header className="bg-white p-4 shadow-sm flex justify-between items-center border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          
          {/* Brand Logo */}
          <h1 className="text-xl font-black tracking-tighter text-blue-900 flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-[28px]">health_and_safety</span>
            PHARMA<span className="font-light text-blue-600">VERIFY</span>
          </h1>
          
          {/* Navigasi Link */}
          <nav className="flex gap-2 border-l border-slate-200 pl-8">
            <NavLink to="/" icon="document_scanner" label="Pemindai AI" />
            <NavLink to="/dashboard" icon="dashboard" label="Sistem ERP & Audit" />
          </nav>

        </div>
        
        {/* Status Server & Profil (Pojok Kanan) */}
        <div className="text-sm font-medium flex items-center gap-5">
          <span className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span> 
            System Online
          </span>
          
          <div className="flex items-center gap-3 border-l border-slate-200 pl-5">
            <span className="bg-slate-100 px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wider text-slate-600 border border-slate-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">warehouse</span>
              WHS-001
            </span>
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-slate-300 shadow-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
              <img 
                src="https://ui-avatars.com/api/?name=Admin+Gudang&background=1e3a8a&color=fff" 
                alt="Profile Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Area Halaman Berubah-ubah di Sini */}
      <main className="p-6 max-w-[1600px] mx-auto">
        <Routes>
          <Route path="/" element={<Scanner />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </main>
      
    </div>
  );
}

// Dibungkus dengan Router di komponen terpisah agar useLocation bisa bekerja
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;