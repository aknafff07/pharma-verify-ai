import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

function Scanner() {
  const [pos, setPos] = useState([]);
  const [selectedPo, setSelectedPo] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [decisionLoading, setDecisionLoading] = useState(false);

  const [activePoData, setActivePoData] = useState(null);

  useEffect(() => {
    fetchPos();
  }, []);

  useEffect(() => {
    if (selectedPo) {
      const found = pos.find(p => p.purchase_id === selectedPo);
      setActivePoData(found);
    } else {
      setActivePoData(null);
    }
  }, [selectedPo, pos]);

  const fetchPos = async () => {
    try {
      const res = await axios.get(`${API_BASE}/pos`);
      setPos(res.data);
    } catch (err) {
      console.error("Gagal menarik data PO:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setScanData(null);
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setScanData(null);
    document.getElementById('doc-upload').value = '';
  };

  const handleVerify = async () => {
    if (!selectedPo || !file) return alert("Pilih PO dan unggah dokumen!");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("po_number", selectedPo);
    formData.append("document", file);

    try {
      const res = await axios.post(`${API_BASE}/verify`, formData, { timeout: 30000 });
      setScanData(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message;
      alert("Gagal memproses dokumen: " + errorMsg + "\nCoba lagi dalam beberapa saat.");
    } finally {
      setLoading(false); 
    }
  };

  const handleDecision = async (decision) => {
    const actionText = decision === 'ACCEPTED' ? 'MENERIMA (MATCH)' : 'MENAHAN (MISMATCH)';
    const isConfirmed = window.confirm(`Apakah Anda yakin ingin ${actionText} material ini?\n\n*Catatan Simulasi: Keputusan ini tidak akan merubah status di database agar bisa diuji kembali.`);

    if (isConfirmed) {
      setLoading(false);
      setDecisionLoading(false);
      
      handleClearFile();
      setSelectedPo("");
      setActivePoData(null);
      
      alert(`Simulasi Selesai! Dokumen pura-puranya telah ${decision === 'ACCEPTED' ? 'DITERIMA' : 'DITAHAN'}.`);
    }
  };

  const renderParameterRow = (label, expectedValue, isMatched = null) => {
    let statusIcon = <span className="material-symbols-outlined text-[12px] text-slate-300">hourglass_empty</span>;
    let bgColor = "bg-slate-50/50";
    let textColor = "text-slate-600";
    
    // PERBAIKAN: Kita pastikan isMatched benar-benar bernilai boolean (true/false)
    if (scanData && (isMatched === true || isMatched === false)) {
      statusIcon = isMatched 
        ? <span className="material-symbols-outlined text-[14px] text-emerald-500 drop-shadow-sm">check_circle</span>
        : <span className="material-symbols-outlined text-[14px] text-rose-500 drop-shadow-sm">cancel</span>;
      bgColor = isMatched ? "bg-emerald-50/80 border-l-2 border-emerald-400" : "bg-rose-50/80 border-l-2 border-rose-400";
      textColor = isMatched ? "text-emerald-700" : "text-rose-700";
    } else {
      bgColor = "bg-slate-50 border-l-2 border-slate-200";
    }

    return (
      <div className={`flex justify-between items-center p-2 rounded-r-md mb-1.5 transition-all duration-300 ${bgColor}`}>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono font-semibold ${textColor}`}>{expectedValue}</span>
          {statusIcon}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[85vh] min-h-[700px] w-full relative">
      {/* GLOBAL STYLES UNTUK ANIMASI LASER & SCROLLBAR */}
      <style>{`
        @keyframes scanLaser {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-laser {
          animation: scanLaser 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>

      <div className="grid grid-cols-5 grid-rows-5 gap-5 h-full">
        
        {/* DIV 1: PARAMETER INITIATION */}
        <div className="col-span-1 row-span-2 col-start-1 row-start-1 bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col min-h-0">
          <h2 className="text-xs font-extrabold mb-4 text-blue-800 tracking-wider uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-blue-600">settings_input_component</span>
            Inisiasi Inspeksi
          </h2>
          
          <div className="mb-4">
            <select 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all shadow-sm cursor-pointer"
              value={selectedPo}
              onChange={(e) => setSelectedPo(e.target.value)}
              disabled={loading || scanData}
            >
              <option value="" className="text-slate-400">-- Hubungkan dengan PO --</option>
              {pos.filter(p => p.status_current === 'PENDING').map(p => (
                <option key={p.id} value={p.purchase_id}>{p.purchase_id} ({p.batch_number})</option>
              ))}
            </select>
          </div>

          <div className={`flex-grow border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all duration-300 relative group cursor-pointer
            ${file ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-300 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300'}`}>
            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" id="doc-upload" onChange={handleFileChange} disabled={loading || scanData || !selectedPo} />
            <div className={`p-3 rounded-full mb-2 transition-transform duration-300 group-hover:-translate-y-1 ${file ? 'bg-emerald-100' : 'bg-white shadow-sm'}`}>
              <span className={`material-symbols-outlined text-2xl ${file ? 'text-emerald-600' : 'text-blue-500'}`}>
                {file ? 'task' : 'cloud_upload'}
              </span>
            </div>
            <p className={`text-[11px] font-semibold px-2 ${file ? 'text-emerald-700' : 'text-slate-600'}`}>
              {file ? file.name : (selectedPo ? "Seret Dokumen ke Sini" : "Pilih PO Dahulu")}
            </p>
          </div>
          
          <button 
            onClick={handleVerify} 
            disabled={loading || !selectedPo || !file || scanData} 
            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 text-white font-bold py-3 rounded-xl text-[11px] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 shrink-0"
          >
            {loading ? <span className="material-symbols-outlined text-[16px] animate-spin">autorenew</span> : <span className="material-symbols-outlined text-[16px]">document_scanner</span>}
            {loading ? "MENGEKSTRAKSI DATA..." : "MULAI VERIFIKASI AI"}
          </button>
        </div>

        {/* DIV 2: TARGET PARAMETER ERP */}
        <div className="col-span-1 row-span-2 col-start-1 row-start-3 bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col min-h-0 overflow-hidden">
          <div className="flex justify-between items-center mb-3 shrink-0 border-b border-slate-100 pb-3">
            <h2 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-500">fact_check</span>
              Target ERP
            </h2>
            {file && !scanData && (
              <button onClick={handleClearFile} className="text-[9px] bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md font-bold hover:bg-rose-100 transition-colors active:scale-95">
                GANTI GAMBAR
              </button>
            )}
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar pt-1 pr-1">
            {!activePoData ? (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                 <span className="material-symbols-outlined text-3xl mb-2 text-slate-300">account_tree</span>
                 <p className="text-[10px] text-center px-4 font-medium">Pilih PO untuk melihat parameter target sistem.</p>
               </div>
            ) : (
               <div className="space-y-1">
                  {renderParameterRow("PO Ref", activePoData.purchase_id, scanData?.verification_details?.["PO Number"])}
                  {renderParameterRow("Material", activePoData.material_name, scanData?.verification_details?.["Material"])}
                  {renderParameterRow("Batch", activePoData.batch_number, scanData?.verification_details?.["Batch No"])}
                  {renderParameterRow("Supplier", activePoData.supplier, scanData?.verification_details?.["Supplier"])}
                  {renderParameterRow("Quantity", `${activePoData.qty_kg} ${activePoData.unit}`, scanData?.verification_details?.["Quantity"])}
                  {renderParameterRow("Exp. Date", activePoData.exp_date, scanData?.verification_details?.["Expiry Date"])}
               </div>
            )}
          </div>
        </div>

        {/* DIV 4: PREVIEW GAMBAR BESAR */}
        <div className="col-span-2 row-span-4 col-start-2 row-start-1 bg-white rounded-2xl shadow-xl border border-white flex flex-col min-h-0 min-w-0 overflow-hidden ring-1 ring-white/5">
          <div className="p-3.5 flex justify-between items-center bg-white backdrop-blur-md border-b border-slate-800/80 text-white shrink-0 z-10">
            <h2 className="text-xs font-bold tracking-widest uppercase flex items-center gap-2 text-slate-700">
              <span className="material-symbols-outlined text-blue-500 text-[18px]">image_search</span>
              Dokumen Fisik
            </h2>
            {loading && <span className="text-[9px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full animate-pulse border border-cyan-400/20">ANALYZING...</span>}
          </div>
          
          <div className="flex-grow relative bg-white overflow-hidden min-h-0 flex items-center justify-center">
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Main Preview" className="absolute inset-0 w-full h-full object-contain p-4 opacity-90" />
                
                {/* EFEK LASER SCANNER YANG DIPERBAIKI */}
                {loading && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_4px_rgba(34,211,238,0.5)] animate-laser z-20"></div>
                )}
                
                {/* Grid Overlay Halus untuk kesan Hi-Tech */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600">
                <span className="material-symbols-outlined text-6xl mb-3 opacity-30">plagiarism</span>
                <p className="text-xs font-medium tracking-wide">Pratinjau dokumen akan muncul di sini</p>
              </div>
            )}
          </div>
        </div>

        {/* DIV 5: EKSTRAKSI GAMBAR AI */}
        <div className="col-span-2 row-span-4 col-start-4 row-start-1 bg-white p-5 rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 flex flex-col min-h-0 min-w-0">
          <div className="mb-3 border-b border-slate-100 pb-3 shrink-0">
            <h2 className="text-xs font-extrabold text-blue-800 tracking-wider uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-blue-600">memory</span>
              Ekstraksi Azure AI
            </h2>
            <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1.5 font-medium">Raw Detected Values</p>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar min-h-0 pr-2">
            {!scanData ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 opacity-60">
                <span className="material-symbols-outlined text-4xl text-slate-300">document_scanner</span>
                <p className="text-[10px] font-medium text-center">Data titik ekstraksi akan<br/>ditampilkan di sini.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {scanData.extracted_data.map((item, idx) => (
                  <div key={idx} className="border-b border-slate-50 pb-2 hover:bg-blue-50/30 transition-colors p-2 rounded-lg group">
                    <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase tracking-widest">{item.key}</label>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 break-all">{item.value}</span>
                      <div className="flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 shrink-0 ml-3 opacity-90 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-black text-emerald-600">{(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DIV 6: LOGIKA PENCOCOKAN & KEPUTUSAN */}
        <div className="col-span-5 row-start-5 bg-white p-5 rounded-2xl shadow-[0_4px_15px_-3px_rgba(6,81,237,0.15)] border border-slate-100 flex flex-col justify-center min-h-0 min-w-0 relative overflow-hidden">
          {/* Garis indikator status di kiri */}
          {scanData && (
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${scanData.ai_recommendation === 'MATCH' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
          )}

          {!scanData ? (
            <div className="flex items-center justify-center h-full text-slate-400 gap-3 opacity-80">
              <span className="material-symbols-outlined text-2xl text-slate-300">gavel</span>
              <p className="text-[11px] font-semibold tracking-widest uppercase">Panel Rekomendasi Sistem & Otoritas Keputusan.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-6 w-full h-full animate-fade-in pl-2">
              
              <div className="flex items-center gap-5 flex-1">
                <div className={`p-3 rounded-full ${scanData.ai_recommendation === 'MATCH' ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <span className={`material-symbols-outlined text-3xl ${scanData.ai_recommendation === 'MATCH' ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {scanData.ai_recommendation === 'MATCH' ? 'verified_user' : 'report_problem'}
                  </span>
                </div>
                <div>
                  <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Analisis Keputusan AI</h2>
                  <p className={`text-[12px] font-bold max-w-2xl leading-relaxed ${scanData.ai_recommendation === 'MATCH' ? 'text-slate-600' : 'text-rose-600'}`}>
                    {scanData.decision_reason}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center px-10 border-x border-slate-100 shrink-0">
                <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold mb-1">STATUS AKHIR</p>
                <h3 className={`text-2xl font-black tracking-tight ${scanData.ai_recommendation === 'MATCH' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {scanData.ai_recommendation}
                </h3>
              </div>
              
              <div className="flex gap-3.5 shrink-0 pl-3">
                <button 
                  onClick={() => handleDecision('QUARANTINED')}
                  className="bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-extrabold px-6 py-3 rounded-xl text-[11px] transition-all duration-200 transform active:scale-95 flex items-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">block</span> TAHAN
                </button>
                <button 
                  onClick={() => handleDecision('ACCEPTED')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-extrabold px-8 py-3 rounded-xl text-[11px] shadow-lg shadow-blue-500/30 transition-all duration-200 transform active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span> TERIMA MATERIAL
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Scanner;