import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = "http://localhost:8000/api";

function Dashboard() {
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // State untuk form input PO baru
  const [newPo, setNewPo] = useState({
    po_number: '',
    material_name: '',
    expected_batch: ''
  });

  useEffect(() => {
    fetchPos();
  }, []);

  const fetchPos = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/pos`);
      setPos(res.data);
    } catch (err) {
      console.error("Gagal menarik data PO:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPo(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePo = async (e) => {
    e.preventDefault();
    if (!newPo.po_number || !newPo.material_name || !newPo.expected_batch) {
      return alert("Mohon lengkapi semua bidang form!");
    }

    setSubmitLoading(true);
    
    // Backend meminta format Form-Data
    const formData = new FormData();
    formData.append("po_number", newPo.po_number);
    formData.append("material_name", newPo.material_name);
    formData.append("expected_batch", newPo.expected_batch);

    try {
      await axios.post(`${API_BASE}/pos/create`, formData);
      alert("PO Baru berhasil ditambahkan ke sistem ERP!");
      setNewPo({ po_number: '', material_name: '', expected_batch: '' }); // Reset form
      fetchPos(); // Refresh tabel data
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert("Gagal membuat PO: " + errorMsg);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Kalkulasi Metrik KPI
  const stats = {
    total: pos.length,
    pending: pos.filter(p => p.status_current === 'PENDING').length,
    received: pos.filter(p => p.status_current === 'RECEIVED').length,
    quarantined: pos.filter(p => p.status_current === 'QUARANTINED').length
  };

  return (
    <div className="flex flex-col gap-6 w-full h-[85vh] min-h-[700px] animate-fade-in relative">
      
      {/* GLOBAL SCROLLBAR STYLE */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* HEADER & KPI CARDS */}
      <div className="grid grid-cols-4 gap-5 shrink-0">
        
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-blue-600 text-[24px]">dataset</span>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Total Pesanan</p>
            <h3 className="text-2xl font-black text-slate-700">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-slate-500 text-[24px]">pending_actions</span>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Menunggu (Pending)</p>
            <h3 className="text-2xl font-black text-slate-600">{stats.pending}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-emerald-400"></div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-emerald-500 text-[24px]">inventory</span>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-emerald-600/70 uppercase">Material Diterima</p>
            <h3 className="text-2xl font-black text-emerald-600">{stats.received}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1.5 h-full bg-rose-400"></div>
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-rose-500 text-[24px]">gpp_bad</span>
          </div>
          <div>
            <p className="text-[10px] font-black tracking-widest text-rose-500/70 uppercase">Material Ditahan</p>
            <h3 className="text-2xl font-black text-rose-600">{stats.quarantined}</h3>
          </div>
        </div>

      </div>

      {/* MAIN CONTENT AREA */}
      <div className="grid flex-grow min-h-0">
        
        {/* KIRI: FORM INPUT PO BARU
        <div className="col-span-1 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-extrabold text-blue-900 tracking-wider uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">add_box</span>
              Buat PO Baru
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Simulasi injeksi pesanan langsung ke database.</p>
          </div>
          
          <form onSubmit={handleCreatePo} className="p-5 flex flex-col flex-grow gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Purchase ID (PO)</label>
              <input 
                type="text" 
                name="po_number"
                value={newPo.po_number}
                onChange={handleInputChange}
                placeholder="Contoh: PUR-099" 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Nama Material</label>
              <input 
                type="text" 
                name="material_name"
                value={newPo.material_name}
                onChange={handleInputChange}
                placeholder="Contoh: Vitamin D3 Powder" 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Target Batch Number</label>
              <input 
                type="text" 
                name="expected_batch"
                value={newPo.expected_batch}
                onChange={handleInputChange}
                placeholder="Contoh: LOT-9999" 
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mt-auto pt-4">
              <button 
                type="submit"
                disabled={submitLoading}
                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 disabled:text-slate-500 text-white font-extrabold py-3 rounded-xl text-[11px] shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                {submitLoading ? <span className="material-symbols-outlined text-[16px] animate-spin">sync</span> : <span className="material-symbols-outlined text-[16px]">save</span>}
                {submitLoading ? "MENYIMPAN..." : "SIMPAN PESANAN"}
              </button>
            </div>
          </form>
        </div> */}

        {/* KANAN: TABEL MASTER DATA ERP */}
        <div className="col-span-2 bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col min-h-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-extrabold text-blue-900 tracking-wider uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-blue-600">table_chart</span>
                Master Data ERP
              </h2>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Daftar Purchase Order dan status logistik saat ini.</p>
            </div>
            <button onClick={fetchPos} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors" title="Refresh Data">
              <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            </button>
          </div>

          <div className="flex-grow overflow-auto custom-scrollbar relative">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3 pl-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Purchase ID</th>
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Material</th>
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Target Batch</th>
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Pemasok</th>
                  <th className="p-3 pr-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((p, index) => (
                  <tr key={p.id} className={`hover:bg-blue-50/30 transition-colors ${index % 2 === 0 ? 'bg-slate-50/30' : 'bg-white'}`}>
                    <td className="p-3 pl-5 text-[11px] font-bold text-slate-700">{p.purchase_id}</td>
                    <td className="p-3 text-[11px] font-semibold text-slate-600 truncate max-w-[150px]" title={p.material_name}>{p.material_name}</td>
                    <td className="p-3 text-[11px] font-mono font-medium text-slate-500">{p.batch_number}</td>
                    <td className="p-3 text-[11px] text-slate-500 truncate max-w-[120px]">{p.supplier || '-'}</td>
                    <td className="p-3 pr-5 flex justify-center">
                      {/* LOGIKA WARNA BADGE STATUS */}
                      {p.status_current === 'PENDING' && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-bold tracking-wider uppercase">Pending</span>
                      )}
                      {p.status_current === 'RECEIVED' && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">check</span> Received
                        </span>
                      )}
                      {p.status_current === 'QUARANTINED' && (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded text-[9px] font-bold tracking-wider uppercase flex items-center gap-1">
                          <span className="material-symbols-outlined text-[10px]">close</span> Quarantined
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                
                {/* Fallback jika kosong */}
                {pos.length === 0 && !loading && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">data_alert</span>
                        <p className="text-xs">Data ERP Kosong.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;