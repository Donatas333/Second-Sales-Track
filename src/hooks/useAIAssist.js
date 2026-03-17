import { useState } from 'react'
import { products } from '../data/products.js'

const API_KEY_STORAGE = 'at_apikey'

export function useAIAssist() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getApiKey = () => localStorage.getItem(API_KEY_STORAGE) || ''
  const saveApiKey = (key) => localStorage.setItem(API_KEY_STORAGE, key)

  const parseInteraction = async ({ transcript, clients }) => {
    const apiKey = getApiKey()
    if (!apiKey) {
      setError('API raktas neįvestas. Paspauskite 🔑 norėdami įvesti.')
      return null
    }

    setLoading(true)
    setError(null)

    const productList = products.slice(0, 40).map(p =>
      `${p.id}|${p.name}|${p.brand}|${p.vehicle}|${p.sku}`
    ).join('\n')

    const clientList = clients.map(c =>
      `${c.id}|${c.companyName}|${c.city}|${c.contactName}`
    ).join('\n')

    const prompt = `Tu esi autodalių pardavėjo asistentas. Išanalizuok šį balso įrašo tekstą ir grąžink JSON.

BALSO TEKSTAS:
"${transcript}"

KLIENTŲ SĄRAŠAS (id|pavadinimas|miestas|kontaktas):
${clientList}

PRODUKTŲ SĄRAŠAS (id|pavadinimas|gamintojas|automobilis|sku):
${productList}

Grąžink TIKTAI JSON be jokių papildomų komentarų ar markdown:
{
  "clientId": "kliento id arba null",
  "summary": "sutrumpintas vizito/skambučio aprašymas lietuviškai",
  "products": [{"id":"...","name":"...","brand":"...","sku":"...","vehicle":"..."}],
  "nextAction": "kitas veiksmas lietuviškai arba null",
  "nextActionDate": "ISO data arba null",
  "type": "visit|phone|email|other"
}

Taisyklės:
- clientId: surask geriausiai atitinkantį klientą pagal pavadinimą, miestą ar kontaktą
- summary: parašyk glaustai ir aiškiai
- products: surask produktus iš sąrašo pagal paminėtus pavadinimus, gamintoją ar automobilio markę
- nextAction: ištrauk aiškų veiksmą (jei neminimas - null)
- nextActionDate: "rytoj" → rytojaus data, "kitą savaitę" → +7 d., skaičiai → ISO data
- type: "visit" jei vizitas, "phone" jei skambutis, "email" jei el. paštas, kitu atveju "other"`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        if (response.status === 401) throw new Error('Neteisingas API raktas')
        if (response.status === 429) throw new Error('Per daug užklausų. Palaukite.')
        throw new Error(err?.error?.message || `Klaida: ${response.status}`)
      }

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const clean = text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(clean)
      setLoading(false)
      return parsed
    } catch (err) {
      setError(err.message || 'Klaida apdorojant AI atsakymą')
      setLoading(false)
      return null
    }
  }

  return { parseInteraction, loading, error, setError, getApiKey, saveApiKey }
}
