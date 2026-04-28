function UploadPanel({
  pos,
  selectedPo,
  setSelectedPo,
  onFileChange,
  onClear,
  onVerify,
  loading,
  file
}) {
  return (
    <div className="flex flex-col gap-4 h-full">

      <div className="card">
        <h2 className="title">Inisiasi</h2>

        <select
          className="input"
          value={selectedPo}
          onChange={(e) => setSelectedPo(e.target.value)}
        >
          <option value="">-- Pilih PO --</option>
          {pos.map(p => (
            <option key={p.id} value={p.po_number}>
              {p.po_number}
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={(e) => onFileChange(e.target.files[0])}
          className="mt-3"
        />
      </div>

      {file && (
        <div className="card flex-1 flex flex-col">
          <p className="text-xs">{file.name}</p>

          <button onClick={onVerify} className="btn-primary mt-auto">
            {loading ? "Processing..." : "Scan AI"}
          </button>

          <button onClick={onClear} className="btn-danger mt-2">
            Hapus
          </button>
        </div>
      )}

    </div>
  );
}

export default UploadPanel;