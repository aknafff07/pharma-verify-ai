function PreviewPanel({ previewUrl }) {
  return (
    <div className="card h-full flex flex-col">
      <h2 className="title">Preview</h2>

      <div className="flex-1 flex items-center justify-center">
        {previewUrl ? (
          <img src={previewUrl} className="max-h-full object-contain" />
        ) : (
          <p className="text-slate-500">No Image</p>
        )}
      </div>
    </div>
  );
}

export default PreviewPanel;