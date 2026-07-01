"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

const API = "http://localhost:8000/api/v1";

interface SupportedFormat {
  type: string;
  label_he: string;
  label_en: string;
  extensions: string[];
  icon: string;
  description: string;
  max_size_mb: number;
}

interface ExtractedTransaction {
  row?: number;
  date: string;
  amount: number;
  type: string;
  description: string;
  category: string | null;
  balance_after: number | null;
}

interface UploadResult {
  upload_id: string;
  file_name: string;
  file_type: string;
  status: string;
  transactions_found: number;
  detected_institution: string | null;
  insights: string[];
  extraction: {
    transactions: ExtractedTransaction[];
    total_transactions: number;
    metadata: Record<string, unknown>;
    errors: { row: number; error: string }[];
  };
  message: string;
}

interface DocumentEntry {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  status: string;
  detected_institution: string | null;
  transactions_extracted: number;
  products_extracted: number;
  insights_count: number;
  uploaded_at: string;
  processed_at: string | null;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [formats, setFormats] = useState<SupportedFormat[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualForm, setManualForm] = useState({ date: "", description: "", amount: "", type: "expense", category: "" });
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [importingId, setImportingId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [docsRes, fmtRes] = await Promise.all([
        fetch(`${API}/ingest/documents`, { headers }),
        fetch(`${API}/ingest/supported-formats`),
      ]);
      if (docsRes.ok) setDocuments(await docsRes.json());
      if (fmtRes.ok) {
        const data = await fmtRes.json();
        setFormats(data.formats || []);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function handleFileUpload(files: FileList | null) {
    if (!files || files.length === 0 || !token) return;
    setUploading(true);
    setUploadResult(null);

    const file = files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API}/ingest/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.detail || "שגיאה בהעלאה");
        return;
      }
      const result: UploadResult = await res.json();
      setUploadResult(result);

      // Select all rows by default
      const allRows = new Set<number>(result.extraction.transactions.map((_, i) => i));
      setSelectedRows(allRows);

      await loadData();
    } catch (err) {
      console.error(err);
      alert("שגיאה בהעלאה");
    } finally {
      setUploading(false);
    }
  }

  async function handleManualEntry() {
    if (!token || !manualForm.amount) return;
    try {
      const res = await fetch(`${API}/ingest/upload/manual`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_type: "transaction",
          date: manualForm.date || new Date().toISOString().split("T")[0],
          amount: manualForm.type === "expense" ? -Math.abs(parseFloat(manualForm.amount)) : Math.abs(parseFloat(manualForm.amount)),
          description: manualForm.description || "הזנה ידנית",
          category: manualForm.category || null,
        }),
      });
      if (res.ok) {
        setManualForm({ date: "", description: "", amount: "", type: "expense", category: "" });
        setShowManual(false);
        await loadData();
      }
    } catch (err) { console.error(err); }
  }

  async function handleAiAnalysis(uploadId: string) {
    if (!token) return;
    try {
      const res = await fetch(`${API}/ingest/analyze/${uploadId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        alert(`ניתוח AI הושלם!\n\n${(data.insights || []).join("\n")}`);
        await loadData();
      }
    } catch (err) { console.error(err); }
  }

  async function handleDelete(uploadId: string) {
    if (!token) return;
    if (!confirm("למחוק את המסמך?")) return;
    try {
      await fetch(`${API}/ingest/documents/${uploadId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadData();
    } catch (err) { console.error(err); }
  }

  function toggleRow(idx: number) {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
  }

  function toggleAllRows() {
    if (!uploadResult) return;
    if (selectedRows.size === uploadResult.extraction.transactions.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(uploadResult.extraction.transactions.map((_, i) => i)));
    }
  }

  const fileTypeIcons: Record<string, string> = { csv: "📊", excel: "📗", pdf: "📄", email: "📧", manual_entry: "✏️" };
  const statusLabels: Record<string, { text: string; color: string }> = {
    pending: { text: "ממתין", color: "text-yellow-400" },
    processing: { text: "מעבד", color: "text-blue-400" },
    completed: { text: "הושלם", color: "text-emerald-400" },
    failed: { text: "נכשל", color: "text-red-400" },
    review: { text: "לבדיקה", color: "text-amber-400" },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir="rtl">
      <Sidebar active="/upload" />
      <main className="mr-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">העלאת מסמכים פיננסיים</h1>
            <p className="text-slate-400 mt-1">ייבוא נתונים מ-CSV, Excel, PDF או הזנה ידנית — ללא חיבור לבנק</p>
          </div>
          <button
            onClick={() => setShowManual(!showManual)}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all"
          >
            ✏️ הזנה ידנית
          </button>
        </div>

        {/* Drop Zone */}
        <div
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer mb-8 ${
            dragActive
              ? "border-amber-400 bg-amber-400/5"
              : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.xlsx,.xls,.pdf,.eml,.msg"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-300">מעבד את הקובץ...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="text-5xl">📁</div>
              <div>
                <p className="text-lg font-medium text-slate-200">גרור קובץ לכאן או לחץ לבחירה</p>
                <p className="text-sm text-slate-500 mt-1">
                  CSV, Excel, PDF, Email — עד 50MB
                </p>
              </div>
              <div className="flex gap-4 mt-2">
                {["📊 CSV", "📗 Excel", "📄 PDF", "📧 Email"].map((f) => (
                  <span key={f} className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Manual Entry Form */}
        {showManual && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 mb-8">
            <h3 className="text-lg font-bold mb-4">הזנה ידנית של תנועה</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">תאריך</label>
                <input
                  type="date"
                  value={manualForm.date}
                  onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">תיאור</label>
                <input
                  type="text"
                  value={manualForm.description}
                  onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
                  placeholder="סופרסל, משכורת..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">סכום (₪)</label>
                <input
                  type="number"
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">סוג</label>
                <select
                  value={manualForm.type}
                  onChange={(e) => setManualForm({ ...manualForm, type: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="expense">הוצאה</option>
                  <option value="income">הכנסה</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleManualEntry}
                  disabled={!manualForm.amount}
                  className="w-full px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 text-sm font-bold transition-all disabled:opacity-40"
                >
                  הוסף
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Result / Preview */}
        {uploadResult && (
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{fileTypeIcons[uploadResult.file_type] || "📁"}</span>
                <div>
                  <h3 className="text-lg font-bold">{uploadResult.file_name}</h3>
                  <p className="text-sm text-slate-400">{uploadResult.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {uploadResult.detected_institution && (
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                    🏦 {uploadResult.detected_institution}
                  </span>
                )}
                <span className={`text-xs px-3 py-1 rounded-full ${
                  uploadResult.status === "completed" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                }`}>
                  {uploadResult.transactions_found} תנועות
                </span>
              </div>
            </div>

            {/* Insights */}
            {uploadResult.insights.length > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 mb-4">
                <h4 className="text-sm font-bold text-amber-300 mb-2">💡 תובנות</h4>
                <ul className="space-y-1">
                  {uploadResult.insights.map((insight, i) => (
                    <li key={i} className="text-sm text-slate-300">• {insight}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Transactions Preview Table */}
            {uploadResult.extraction.transactions.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-300">
                    תנועות שזוהו ({selectedRows.size} מתוך {uploadResult.extraction.transactions.length} נבחרו)
                  </h4>
                  <button
                    onClick={toggleAllRows}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    {selectedRows.size === uploadResult.extraction.transactions.length ? "בטל הכל" : "בחר הכל"}
                  </button>
                </div>
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto rounded-xl border border-white/5">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 sticky top-0">
                      <tr className="text-slate-400">
                        <th className="px-3 py-2 text-right w-10">✓</th>
                        <th className="px-3 py-2 text-right">תאריך</th>
                        <th className="px-3 py-2 text-right">תיאור</th>
                        <th className="px-3 py-2 text-left">סכום</th>
                        <th className="px-3 py-2 text-right">סוג</th>
                      </tr>
                    </thead>
                    <tbody>
                      {uploadResult.extraction.transactions.map((tx, i) => (
                        <tr
                          key={i}
                          className={`border-t border-white/5 cursor-pointer transition-colors ${
                            selectedRows.has(i) ? "bg-white/[0.03]" : "opacity-40"
                          }`}
                          onClick={() => toggleRow(i)}
                        >
                          <td className="px-3 py-2">
                            <input type="checkbox" checked={selectedRows.has(i)} readOnly className="accent-amber-500" />
                          </td>
                          <td className="px-3 py-2 text-slate-300">{tx.date}</td>
                          <td className="px-3 py-2 text-white">{tx.description}</td>
                          <td className={`px-3 py-2 text-left font-mono ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString("he-IL", { style: "currency", currency: "ILS" })}
                          </td>
                          <td className="px-3 py-2">
                            <span className={`text-xs px-2 py-0.5 rounded ${tx.type === "income" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}`}>
                              {tx.type === "income" ? "הכנסה" : "הוצאה"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {uploadResult.extraction.total_transactions > 50 && (
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    מציג 50 מתוך {uploadResult.extraction.total_transactions} תנועות
                  </p>
                )}

                {/* Action: close preview */}
                <div className="flex justify-end mt-4 gap-3">
                  <button
                    onClick={() => handleAiAnalysis(uploadResult.upload_id)}
                    className="px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-sm font-medium transition-all border border-purple-500/20"
                  >
                    🤖 ניתוח AI מתקדם
                  </button>
                  <button
                    onClick={() => setUploadResult(null)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-slate-300 transition-all"
                  >
                    סגור
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents History */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-6">
          <h3 className="text-lg font-bold mb-4">היסטוריית מסמכים</h3>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">📂</div>
              <p className="text-slate-400">עדיין לא הועלו מסמכים</p>
              <p className="text-sm text-slate-500 mt-1">העלה קובץ CSV, Excel או PDF מהבנק או חברת האשראי</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const status = statusLabels[doc.status] || { text: doc.status, color: "text-slate-400" };
                return (
                  <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                    <span className="text-2xl">{fileTypeIcons[doc.file_type] || "📁"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{doc.file_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs ${status.color}`}>{status.text}</span>
                        <span className="text-xs text-slate-500">
                          {doc.transactions_extracted} תנועות
                        </span>
                        {doc.detected_institution && (
                          <span className="text-xs text-slate-500">🏦 {doc.detected_institution}</span>
                        )}
                        {doc.file_size && (
                          <span className="text-xs text-slate-600">
                            {(doc.file_size / 1024).toFixed(0)}KB
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAiAnalysis(doc.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-all"
                        title="ניתוח AI"
                      >
                        🤖
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 transition-all"
                        title="מחק"
                      >
                        🗑️
                      </button>
                    </div>
                    <span className="text-xs text-slate-600">
                      {new Date(doc.uploaded_at).toLocaleDateString("he-IL")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Supported Formats Info */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          {formats.map((fmt) => (
            <div key={fmt.type} className="rounded-xl bg-white/[0.02] border border-white/5 p-4 text-center">
              <div className="text-2xl mb-2">{fmt.icon}</div>
              <p className="text-sm font-medium text-white">{fmt.label_he}</p>
              <p className="text-xs text-slate-500 mt-1">{fmt.description}</p>
              {fmt.extensions.length > 0 && (
                <p className="text-[10px] text-slate-600 mt-2">{fmt.extensions.join(", ")}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
