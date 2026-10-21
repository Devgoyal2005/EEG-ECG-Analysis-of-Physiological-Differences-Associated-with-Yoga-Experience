import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Search, 
  Table as TableIcon, 
  Layers, 
  Filter, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

export default function ExcelViewerPage() {
  const [overview, setOverview] = useState([]);
  const [selectedWbId, setSelectedWbId] = useState('module1');
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch overview of workbooks and sheets
  useEffect(() => {
    fetch('/api/dataset/excel-overview')
      .then(res => res.json())
      .then(data => {
        setOverview(data);
        if (data.length > 0) {
          const firstExisting = data.find(w => w.exists) || data[0];
          setSelectedWbId(firstExisting.id);
          if (firstExisting.sheets?.length > 0) {
            setSelectedSheet(firstExisting.sheets[0].sheet_name);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentWb = overview.find(w => w.id === selectedWbId);

  // Fetch sheet contents when workbook or sheet changes
  useEffect(() => {
    if (!currentWb || !currentWb.exists || !selectedSheet) {
      setSheetData(null);
      return;
    }

    setTableLoading(true);
    fetch(`/api/dataset/excel-sheet-content?filename=${encodeURIComponent(currentWb.filename)}&sheet_name=${encodeURIComponent(selectedSheet)}`)
      .then(res => res.json())
      .then(data => {
        setSheetData(data);
        setTableLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTableLoading(false);
      });
  }, [selectedWbId, selectedSheet]);

  const handleSelectWb = (wb) => {
    setSelectedWbId(wb.id);
    if (wb.sheets?.length > 0) {
      setSelectedSheet(wb.sheets[0].sheet_name);
    } else {
      setSelectedSheet('');
    }
  };

  // Filter rows by search query
  const filteredRows = (sheetData?.rows || []).filter(row => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(row).some(val => 
      val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Download */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white">In-Browser Excel Sheets Viewer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse and inspect all generated tabular research data, feature matrices, and statistical reports directly in the browser.
          </p>
        </div>

        {currentWb?.exists && (
          <a
            href={`/api/${currentWb.id}/download`}
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Download {currentWb.filename}
          </a>
        )}
      </div>

      {/* Workbook Selector Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {overview.map((wb) => {
          const isSelected = selectedWbId === wb.id;
          return (
            <button
              key={wb.id}
              onClick={() => handleSelectWb(wb)}
              className={`p-3 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                  : 'bg-cardbg border-bordercol hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-400' : 'text-white'}`}>
                  {wb.title}
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  wb.exists ? 'bg-emerald-900/40 text-emerald-300' : 'bg-slate-800 text-slate-500'
                }`}>
                  {wb.exists ? `${wb.file_size_kb} KB` : 'Not run'}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate">
                {wb.filename}
              </p>
              <div className="text-[10px] text-slate-500 mt-1">
                {wb.sheets?.length || 0} sheets included
              </div>
            </button>
          );
        })}
      </div>

      {/* Sheet Tabs & Search Bar */}
      <div className="p-5 rounded-xl bg-cardbg border border-bordercol space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bordercol pb-3">
          {/* Sheet tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
              <TableIcon className="w-3.5 h-3.5 text-emerald-400" /> Sheets:
            </span>
            {currentWb?.sheets?.map((s) => {
              const isActive = selectedSheet === s.sheet_name;
              return (
                <button
                  key={s.sheet_name}
                  onClick={() => setSelectedSheet(s.sheet_name)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition shrink-0 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span>{s.sheet_name}</span>
                  <span className="ml-1.5 text-[10px] opacity-75 font-mono">({s.row_count})</span>
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative shrink-0 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter sheet rows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Sheet Table View */}
        {tableLoading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            <span className="text-xs">Reading sheet data...</span>
          </div>
        ) : sheetData?.columns?.length > 0 ? (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
              <span>Showing {filteredRows.length} of {sheetData.total_rows} rows</span>
              <span>{sheetData.columns.length} columns</span>
            </div>

            <div className="overflow-x-auto max-h-[500px] border border-bordercol rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 sticky top-0 z-10">
                  <tr className="border-b border-bordercol text-slate-300">
                    <th className="py-2 px-3 w-10 text-slate-500 font-mono">#</th>
                    {sheetData.columns.map((col) => (
                      <th key={col} className="py-2.5 px-3 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bordercol font-mono text-slate-300">
                  {filteredRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/50 transition">
                      <td className="py-2 px-3 text-slate-500 text-[10px]">{rIdx + 1}</td>
                      {sheetData.columns.map((col) => {
                        const val = row[col];
                        const isNumber = typeof val === 'number';
                        return (
                          <td key={col} className="py-2 px-3 whitespace-nowrap text-slate-200">
                            {val === null || val === undefined ? (
                              <span className="text-slate-600">-</span>
                            ) : Array.isArray(val) ? (
                              JSON.stringify(val)
                            ) : isNumber ? (
                              Number.isInteger(val) ? val : Number(val).toFixed(4)
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 text-xs">
            No sheet selected or workbook not generated yet. Run the pipeline first to create the Excel reports.
          </div>
        )}
      </div>
    </div>
  );
}
