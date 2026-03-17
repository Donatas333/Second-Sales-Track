import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'
import { useAIAssist } from '../hooks/useAIAssist.js'
import VoiceRecorder from '../components/VoiceRecorder.jsx'
import ProductSearch from '../components/ProductSearch.jsx'
import { PageHeader } from '../components/InteractionCard.jsx'
import { INTERACTION_TYPES } from '../utils/helpers.js'

const QUICK_ACTIONS = [
  'Išsiųsti sąskaitą', 'Atsiųsti kainų išrašą', 'Paskambinti',
  'Pristatyti užsakymą', 'Paruošti pasiūlymą', 'Patikrinti sandėlį',
  'Susitikti', 'Išsiųsti katalogą'
]

function toLocalDate(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function toLocalTime(iso) {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export default function NewInteraction() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetClient = searchParams.get('client')

  const { clients, addInteraction } = useStore()
  const { parseInteraction, loading: aiLoading, error: aiError, setError: setAiError, getApiKey, saveApiKey } = useAIAssist()

  const now = new Date()

  const [form, setForm] = useState({
    clientId: presetClient || '',
    type: 'visit',
    date: toLocalDate(now.toISOString()),
    time: toLocalTime(now.toISOString()),
    summary: '',
    products: [],
    nextAction: '',
    nextActionDate: '',
    nextActionTime: '',
  })

  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey())
  const [success, setSuccess] = useState(false)
  const [clientSearch, setClientSearch] = useState('')

  const transcriptRef = useRef('')

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  // Progress dots
  const progress = [
    form.clientId,
    form.summary.trim(),
    form.products.length > 0,
    form.nextAction.trim(),
  ]
  const progressCount = progress.filter(Boolean).length

  const handleTranscript = (text, isFinal) => {
    if (isFinal) {
      transcriptRef.current += ' ' + text
      set('summary', (form.summary + ' ' + text).trim())
    }
  }

  const handleAI = async () => {
    const transcript = transcriptRef.current || form.summary
    if (!transcript.trim()) return
    const result = await parseInteraction({ transcript, clients })
    if (!result) return
    if (result.clientId) set('clientId', result.clientId)
    if (result.summary) set('summary', result.summary)
    if (result.products?.length) set('products', result.products)
    if (result.nextAction) set('nextAction', result.nextAction)
    if (result.nextActionDate) {
      const d = new Date(result.nextActionDate)
      set('nextActionDate', toLocalDate(d.toISOString()))
    }
    if (result.type) set('type', result.type)
  }

  const handleSaveApiKey = () => {
    saveApiKey(apiKeyInput)
    setShowApiKey(false)
  }

  const handleSubmit = () => {
    if (!form.clientId) return alert('Pasirinkite klientą')
    if (!form.summary.trim()) return alert('Įveskite santrauką')

    // Build ISO date
    const dateStr = `${form.date}T${form.time || '12:00'}:00`
    const dateISO = new Date(dateStr).toISOString()

    let nextActionDate = null
    if (form.nextAction && form.nextActionDate) {
      const naStr = `${form.nextActionDate}T${form.nextActionTime || '09:00'}:00`
      nextActionDate = new Date(naStr).toISOString()
    }

    addInteraction({
      clientId: form.clientId,
      type: form.type,
      date: dateISO,
      summary: form.summary.trim(),
      products: form.products,
      nextAction: form.nextAction.trim(),
      nextActionDate,
    })

    setSuccess(true)
    setTimeout(() => navigate(`/clients/${form.clientId}`), 700)
  }

  const filteredClients = clients.filter(c => {
    if (!clientSearch) return true
    const q = clientSearch.toLowerCase()
    return c.companyName.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
  })

  if (success) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-slide-up">
          <div className="text-7xl mb-4">✅</div>
          <p className="font-display font-bold text-2xl uppercase text-slate-100">Išsaugota!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container animate-slide-up">
      {/* Header with progress */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2 -ml-2 text-slate-400">←</button>
        <h1 className="font-display font-bold text-2xl uppercase tracking-wide text-slate-100 flex-1">Naujas vizitas</h1>
        <div className="flex gap-1.5">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300
              ${i < progressCount ? 'bg-brand-500' : 'bg-slate-700'}`} />
          ))}
        </div>
      </div>

      {/* Voice + Summary */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="label mb-0">Balso įrašas</span>
          <div className="flex gap-2">
            <button onClick={() => setShowApiKey(!showApiKey)}
              className="btn-ghost py-1 px-2 text-xs text-slate-400">🔑 API</button>
            {form.summary.trim() && (
              <button onClick={handleAI} disabled={aiLoading}
                className="flex items-center gap-1.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-300 text-xs font-semibold rounded-lg px-3 py-1.5 transition-all disabled:opacity-50">
                {aiLoading ? '⏳' : '✦'} {aiLoading ? 'Apdoroja...' : 'AI užpildyti'}
              </button>
            )}
          </div>
        </div>

        {showApiKey && (
          <div className="mb-3 flex gap-2">
            <input type="password" value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..." className="input-field text-sm flex-1" />
            <button onClick={handleSaveApiKey} className="btn-secondary text-sm px-4">Išsaugoti</button>
          </div>
        )}

        <VoiceRecorder onInterimTranscript={handleTranscript} />

        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="label mb-0">Santrauka</span>
            {form.summary && (
              <button onClick={() => { set('summary', ''); transcriptRef.current = '' }}
                className="text-xs text-slate-500 hover:text-slate-300">Išvalyti</button>
            )}
          </div>
          <textarea
            value={form.summary}
            onChange={e => set('summary', e.target.value)}
            rows={4}
            placeholder="Aprašykite vizitą lietuviškai... (arba diktuo­kite aukščiau)"
            className="input-field text-sm"
          />
        </div>

        {aiError && (
          <div className="mt-2 bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex justify-between">
            <p className="text-red-400 text-xs">{aiError}</p>
            <button onClick={() => setAiError(null)} className="text-red-500 text-xs">✕</button>
          </div>
        )}
      </div>

      {/* Client */}
      <div className="card mb-4">
        <label className="label">Klientas</label>
        <input
          type="text"
          value={clientSearch}
          onChange={e => setClientSearch(e.target.value)}
          placeholder="Ieškoti kliento..."
          className="input-field text-sm mb-2"
        />
        <div className="max-h-36 overflow-y-auto flex flex-col gap-1">
          {filteredClients.map(c => (
            <button key={c.id} onClick={() => { set('clientId', c.id); setClientSearch(c.companyName) }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all
                ${form.clientId === c.id ? 'bg-brand-500/20 border border-brand-500/40' : 'hover:bg-slate-700/50'}`}>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-100 truncate">{c.companyName}</p>
                <p className="text-xs text-slate-400">{c.city}</p>
              </div>
              {form.clientId === c.id && <span className="ml-auto text-brand-400">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="card mb-4">
        <label className="label">Tipas</label>
        <div className="grid grid-cols-4 gap-2">
          {INTERACTION_TYPES.map(t => (
            <button key={t.value} onClick={() => set('type', t.value)}
              className={`flex flex-col items-center gap-1 rounded-xl py-2.5 px-2 border text-xs font-medium transition-all
                ${form.type === t.value ? `${t.bg} ${t.color}` : 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:bg-slate-700/60'}`}>
              <span className="text-lg">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Date & Time */}
      <div className="card mb-4">
        <label className="label">Data ir laikas</label>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input-field text-sm" />
          <input type="time" step="300" value={form.time} onChange={e => set('time', e.target.value)} className="input-field text-sm" />
        </div>
      </div>

      {/* Products */}
      <div className="card mb-4">
        <label className="label">Produktai ({form.products.length})</label>
        <ProductSearch selectedProducts={form.products} onChange={p => set('products', p)} />
      </div>

      {/* Next action */}
      <div className="card mb-4">
        <label className="label">Kitas žingsnis</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {QUICK_ACTIONS.map(a => (
            <button key={a} onClick={() => set('nextAction', form.nextAction === a ? '' : a)}
              className={`text-xs rounded-lg px-3 py-1.5 border transition-all
                ${form.nextAction === a
                  ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                  : 'bg-slate-700/40 border-slate-600/40 text-slate-400 hover:bg-slate-700/60'}`}>
              {a}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={form.nextAction}
          onChange={e => set('nextAction', e.target.value)}
          placeholder="Arba įveskite patys..."
          className="input-field text-sm"
        />
      </div>

      {/* Deadline */}
      {form.nextAction && (
        <div className="card mb-6">
          <label className="label">Terminas</label>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.nextActionDate} onChange={e => set('nextActionDate', e.target.value)} className="input-field text-sm" />
            <input type="time" step="300" value={form.nextActionTime} onChange={e => set('nextActionTime', e.target.value)} className="input-field text-sm" />
          </div>
        </div>
      )}

      {/* Submit */}
      <button onClick={handleSubmit} className="btn-primary w-full py-4 text-base">
        💾 Išsaugoti vizitą
      </button>
    </div>
  )
}
