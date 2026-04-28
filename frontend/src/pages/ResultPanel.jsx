function ResultPanel({ scanData, onDecision, loading }) {
  return (
    <div className="card flex justify-between items-center">

      <div>
        <h2 className="title">Hasil</h2>
        <h1 className="text-3xl font-bold">
          {scanData.ai_recommendation}
        </h1>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onDecision("QUARANTINED")}
          className="btn-danger"
        >
          Tahan
        </button>

        <button
          onClick={() => onDecision("ACCEPTED")}
          className="btn-success"
        >
          Terima
        </button>
      </div>

    </div>
  );
}

export default ResultPanel;