import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Cpu, 
  Key, 
  Copy, 
  Check, 
  Play, 
  ExternalLink, 
  Database, 
  ShoppingBag, 
  RefreshCw, 
  Code2, 
  Server,
  Zap
} from 'lucide-react';

export const ApiIntegrationModal: React.FC = () => {
  const { simulateWarehouseSync, simulateIncomingEcommerceOrder, products, orders } = useApp();
  const [apiKey, setApiKey] = useState('wrg_live_9f88a27b1c4e91024e88');
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState<'inventory' | 'webhook' | 'analytics'>('inventory');
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleGenerateNewKey = () => {
    const newKey = 'wrg_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 10);
    setApiKey(newKey);
  };

  const handleTestEcommerceWebhook = () => {
    simulateIncomingEcommerceOrder();
    setSimulationStatus('✅ Webhook Pesanan E-Commerce Berhasil Diterima! Cek tab "Pesanan Warga".');
    setTimeout(() => setSimulationStatus(null), 4000);
  };

  const handleTestWarehouseSync = () => {
    simulateWarehouseSync();
    setSimulationStatus('✅ Sinkronisasi Stok Gudang Berhasil! Stok produk bertambah secara otomatis.');
    setTimeout(() => setSimulationStatus(null), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <span>Pusat Integrasi API & Webhook Warung</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                REST v1.0
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sinkronisasi inventaris gudang, webhook platform e-commerce (Tokopedia/Shopee), & analitik pihak ketiga.
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2 text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>API Gateway Active (200 OK)</span>
        </div>
      </div>

      {/* API Key Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-indigo-600" />
            <span>Kunci Otentikasi API (Bearer Token Secret):</span>
          </label>
          <button
            onClick={handleGenerateNewKey}
            className="text-[11px] text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            Regenerasi Kunci Baru
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={apiKey}
            className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-slate-800 dark:text-slate-200"
          />
          <button
            onClick={handleCopyKey}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-indigo-200 dark:border-indigo-800"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey ? 'Disalin!' : 'Salin Kunci'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm">Konsol Pengujian Simulasi API Real-Time</h3>
          </div>
          <span className="text-[10px] text-indigo-300">Sandbox Playground</span>
        </div>
        <p className="text-xs text-indigo-200 leading-relaxed">
          Uji langsung integrasi sistem otomatis: Simulasikan pesanan masuk dari platform e-commerce eksternal atau restock otomatis dari API Gudang pusat.
        </p>

        {simulationStatus && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-semibold animate-in fade-in">
            {simulationStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            onClick={handleTestEcommerceWebhook}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulasikan Webhook Pesanan E-Commerce Masuk</span>
          </button>

          <button
            onClick={handleTestWarehouseSync}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Simulasikan API Sinkronisasi Stok Gudang</span>
          </button>
        </div>
      </div>

      {/* REST API Endpoints Documentation */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Code2 className="w-4 h-4 text-indigo-600" />
          <span>Daftar Endpoint API Warung Pintar:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {[
            { id: 'inventory' as const, method: 'GET', path: '/api/v1/inventory', desc: 'Query stok inventaris' },
            { id: 'webhook' as const, method: 'POST', path: '/api/v1/orders/webhook', desc: 'Inbound pesanan e-commerce' },
            { id: 'analytics' as const, method: 'GET', path: '/api/v1/sales/analytics', desc: 'Ekspor data analitik pihak ketiga' },
          ].map(ep => (
            <button
              key={ep.id}
              onClick={() => setActiveEndpoint(ep.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                activeEndpoint === ep.id
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                ep.method === 'GET' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {ep.method}
              </span>
              <p className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-1">
                {ep.path}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{ep.desc}</p>
            </button>
          ))}
        </div>

        {/* Live Payload Preview */}
        <div className="p-3.5 bg-slate-950 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto space-y-1.5">
          <div className="flex justify-between text-slate-400 text-[10px] border-b border-slate-800 pb-1">
            <span>Payload Request / Response Mockup</span>
            <span>Content-Type: application/json</span>
          </div>
          {activeEndpoint === 'inventory' && (
            <pre className="text-emerald-400 leading-relaxed">{`// GET /api/v1/inventory
Headers: { "Authorization": "Bearer ${apiKey}" }

Response 200 OK:
{
  "status": "success",
  "total_sku": ${products.length},
  "items": [
    {
      "id": "prod-1",
      "name": "Beras Pandan Wangi Super 5kg",
      "sku": "BRS-PW-05",
      "stock": ${products[0]?.stock || 18},
      "min_stock": 5,
      "selling_price": 72500,
      "status": "in_stock"
    }
  ]
}`}</pre>
          )}

          {activeEndpoint === 'webhook' && (
            <pre className="text-blue-400 leading-relaxed">{`// POST /api/v1/orders/webhook
Headers: { "X-Warung-Signature": "sha256=...", "Content-Type": "application/json" }

Payload:
{
  "event": "order.created",
  "source": "tokopedia",
  "order_id": "TP-9823101",
  "customer": { "name": "Budi Santoso", "phone": "0812345678" },
  "items": [{ "sku": "BRS-PW-05", "qty": 1, "price": 72500 }],
  "payment": { "method": "instant_transfer", "status": "paid" }
}`}</pre>
          )}

          {activeEndpoint === 'analytics' && (
            <pre className="text-purple-400 leading-relaxed">{`// GET /api/v1/sales/analytics?period=monthly
Response 200 OK:
{
  "warung_name": "Warung Berkah Sembako",
  "currency": "IDR",
  "total_revenue": ${orders.reduce((a, b) => a + b.totalAmount, 0)},
  "total_orders": ${orders.length},
  "top_sku": "BRS-PW-05"
}`}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
