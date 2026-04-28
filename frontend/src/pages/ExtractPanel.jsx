function ExtractPanel({ scanData }) {
  return (
    <div className="card h-full overflow-auto">
      <h2 className="title">Extract Data</h2>

      {!scanData ? (
        <p className="text-slate-500">Menunggu...</p>
      ) : (
        <table className="w-full text-xs">
          <tbody>
            {scanData.extracted_data.map((item, i) => (
              <tr key={i}>
                <td className="text-slate-400">{item.key}</td>
                <td className="font-bold">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ExtractPanel;