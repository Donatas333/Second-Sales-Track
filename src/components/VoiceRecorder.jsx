import { useState, useRef, useCallback } from 'react'

export default function VoiceRecorder({ onInterimTranscript }) {
  const [state, setState] = useState('idle') // idle | recording | error
  const [interimText, setInterimText] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const shouldBeListeningRef = useRef(false)
  const recognitionRef = useRef(null)
  const restartTimerRef = useRef(null)

  const createAndStart = useCallback(() => {
    if (!shouldBeListeningRef.current) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setErrorMsg('Naršyklė nepalaiko balso įrašymo. Naudokite Chrome.')
      setState('error')
      return
    }

    const rec = new SR()
    recognitionRef.current = rec
    rec.lang = 'lt-LT'
    rec.continuous = true
    rec.interimResults = true

    rec.onerror = (e) => {
      if (e.error === 'no-speech') return
      if (e.error === 'aborted') return
      if (e.error === 'not-allowed') {
        setErrorMsg('Mikrofonas užblokuotas. Leiskite prieigą naršyklėje.')
        setState('error')
        shouldBeListeningRef.current = false
        return
      }
    }

    rec.onend = () => {
      setInterimText('')
      if (shouldBeListeningRef.current) {
        restartTimerRef.current = setTimeout(() => createAndStart(), 150)
      } else {
        setState('idle')
      }
    }

    rec.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          onInterimTranscript?.(transcript, true)
        } else {
          interim += transcript
        }
      }
      setInterimText(interim)
    }

    try {
      rec.start()
      setState('recording')
    } catch {
      // ignore
    }
  }, [onInterimTranscript])

  const startRecording = () => {
    setErrorMsg('')
    shouldBeListeningRef.current = true
    createAndStart()
  }

  const stopRecording = () => {
    shouldBeListeningRef.current = false
    clearTimeout(restartTimerRef.current)
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    setState('idle')
    setInterimText('')
  }

  const toggle = () => {
    if (state === 'recording') stopRecording()
    else startRecording()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={toggle}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-200 font-bold
          ${state === 'recording'
            ? 'bg-red-500/20 border-2 border-red-500 text-red-400 pulse-ring'
            : 'bg-slate-700/60 border-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 active:scale-95'
          }`}
      >
        {state === 'recording' ? (
          <div className="flex items-end gap-0.5 h-8">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="wave-bar w-1.5 bg-red-400 rounded-full" style={{ height: '8px' }} />
            ))}
          </div>
        ) : '🎤'}
      </button>

      <p className={`text-xs text-center font-medium ${state === 'recording' ? 'text-red-400' : 'text-slate-500'}`}>
        {state === 'recording' ? 'Įrašoma — galite daryti pauzes' : 'Paspauskite norėdami diktuoti'}
      </p>

      {interimText && (
        <div className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl p-3">
          <p className="text-slate-400 text-sm italic">{interimText}...</p>
        </div>
      )}

      {errorMsg && (
        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-3">
          <p className="text-red-400 text-sm">{errorMsg}</p>
        </div>
      )}
    </div>
  )
}
