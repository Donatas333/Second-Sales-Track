import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '../hooks/useStore.jsx'
import { PageHeader } from '../components/InteractionCard.jsx'

export default function ClientFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { addClient, updateClient, getClient } = useStore()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    companyName: '', contactName: '', city: '', phone: '', notes: ''
  })

  useEffect(() => {
    if (isEdit) {
      const c = getClient(id)
      if (c) setForm({ companyName: c.companyName, contactName: c.contactName, city: c.city, phone: c.phone || '', notes: c.notes || '' })
    }
  }, [id])

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }))

  const handleSubmit = () => {
    if (!form.companyName.trim()) return alert('Įveskite įmonės pavadinimą')
    if (isEdit) {
      updateClient(id, form)
      navigate(`/clients/${id}`)
    } else {
      const c = addClient(form)
      navigate(`/clients/${c.id}`)
    }
  }

  return (
    <div className="page-container animate-slide-up">
      <PageHeader title={isEdit ? 'Redaguoti klientą' : 'Naujas klientas'} back={true} />

      <div className="flex flex-col gap-4">
        <div>
          <label className="label">Įmonės pavadinimas *</label>
          <input className="input-field" placeholder="UAB Autoaibė" value={form.companyName}
            onChange={e => set('companyName', e.target.value)} />
        </div>
        <div>
          <label className="label">Kontaktas</label>
          <input className="input-field" placeholder="Vardas Pavardė" value={form.contactName}
            onChange={e => set('contactName', e.target.value)} />
        </div>
        <div>
          <label className="label">Miestas</label>
          <input className="input-field" placeholder="Vilnius" value={form.city}
            onChange={e => set('city', e.target.value)} />
        </div>
        <div>
          <label className="label">Telefonas</label>
          <input className="input-field" type="tel" placeholder="+370 600 00000" value={form.phone}
            onChange={e => set('phone', e.target.value)} />
        </div>
        <div>
          <label className="label">Pastabos</label>
          <textarea className="input-field" rows={3} placeholder="Pastabos apie klientą..."
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="flex gap-3 mt-2">
          <button onClick={() => navigate(-1)} className="btn-secondary flex-1">Atšaukti</button>
          <button onClick={handleSubmit} className="btn-primary flex-1">
            {isEdit ? 'Išsaugoti' : 'Sukurti klientą'}
          </button>
        </div>
      </div>
    </div>
  )
}
