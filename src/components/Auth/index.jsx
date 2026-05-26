import { useState } from 'react'
import { usePlayerContext } from '../../contexts/PlayerContext'

const styles = {
  page: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--sc-green)', padding: 24 },
  logo: { fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '0.12em', color: 'var(--sc-cream)', marginBottom: 4 },
  logoSpan: { color: 'var(--gold)' },
  rule: { width: 40, height: 2, background: 'var(--gold)', margin: '12px auto 28px' },
  form: { width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 },
  input: { fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', padding: '12px 14px', background: 'rgba(242,237,227,0.06)', border: '1px solid rgba(242,237,227,0.2)', borderRadius: 4, color: 'var(--sc-cream)', letterSpacing: '0.04em' },
  btn: { fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.18em', padding: '12px 0', background: 'var(--gold)', color: 'var(--ink)', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 },
  sent: { fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.7rem', color: 'rgba(242,237,227,0.6)', textAlign: 'center', lineHeight: 1.7, maxWidth: 280 },
  error: { fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.65rem', color: '#e06060', textAlign: 'center' },
  hint: { marginTop: 16, fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.55rem', color: 'rgba(242,237,227,0.25)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.15em' },
}

export default function Auth() {
  const { signIn } = usePlayerContext()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const { error } = await signIn(email)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div style={styles.page}>
      <div style={styles.logo}>THE <span style={styles.logoSpan}>TIFF</span></div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'rgba(242,237,227,0.35)', textTransform: 'uppercase', letterSpacing: '0.22em' }}>
        Annual Golf Championship
      </div>
      <div style={styles.rule} />

      {sent ? (
        <p style={styles.sent}>Check your email for a magic link to sign in.</p>
      ) : (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit" style={styles.btn}>Send magic link</button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      )}
      <p style={styles.hint}>Members only · Magic link access</p>
    </div>
  )
}
