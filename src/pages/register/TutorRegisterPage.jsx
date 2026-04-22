import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import logoUrl from '../../assets/logo_relance.jpg'

function PasswordField({ value, onChange }) {
  const [show, setShow] = useState(false)
  const score = !value ? 0 : value.length < 6 ? 1 : value.length < 8 ? 2 : /[A-Z]/.test(value) && /[0-9]/.test(value) ? 4 : 3
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-brand']
  const labels = ['', 'Muy débil', 'Débil', 'Media', 'Fuerte']
  return (
    <div>
      <div className="relative">
        <input type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="Mínimo 8 caracteres" required minLength={8} className="input-field pr-10" />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>
      {value && (
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4].map((lvl) => (
            <div key={lvl} className={`h-1 flex-1 rounded-full transition-all duration-300 ${score >= lvl ? colors[score] : 'bg-white/10'}`} />
          ))}
          <span className="text-xs text-gray-500 w-16 text-right">{labels[score]}</span>
        </div>
      )}
    </div>
  )
}

export default function TutorRegisterPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const entityId = params.get('entity')    // ID de empresa o centro
  const entityType = params.get('type')    // 'empresa' | 'centro_educativo'

  const [entityInfo, setEntityInfo] = useState(null)
  const [loadingEntity, setLoadingEntity] = useState(true)
  const [invalidToken, setInvalidToken] = useState(false)

  const [form, setForm] = useState({
    fullName: '', email: '', password: '', confirmPassword: '',
    phone: '', specialty: '',
  })
  const s = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Cargar información de la entidad invitante
  useEffect(() => {
    const loadEntity = async () => {
      if (!token || !entityId || !entityType) {
        setInvalidToken(true)
        setLoadingEntity(false)
        return
      }

      // Verificar que el token es válido en la tabla invite_tokens
      const { data: tokenData, error: tokenError } = await supabase
        .from('invite_tokens')
        .select('*, profiles(*)')
        .eq('token', token)
        .eq('entity_id', entityId)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (tokenError || !tokenData) {
        setInvalidToken(true)
        setLoadingEntity(false)
        return
      }

      setEntityInfo({
        name: tokenData.profiles?.company_name || tokenData.profiles?.center_name || 'Entidad',
        type: entityType,
        id: entityId,
      })
      setLoadingEntity(false)
    }
    loadEntity()
  }, [token, entityId, entityType])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden.'); return }
    if (form.password.length < 8) { setError('Mínimo 8 caracteres.'); return }
    setLoading(true)
    setError(null)

    const role = entityType === 'empresa' ? 'tutor_empresa' : 'tutor_centro'

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.fullName,
          role,
          phone: form.phone,
          specialty: form.specialty,
          entity_id: entityId,
          entity_type: entityType,
          invite_token: token,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Marcar token como usado
    await supabase.from('invite_tokens').update({ used: true, used_at: new Date().toISOString() }).eq('token', token)

    setLoading(false)
    setSuccess(true)
  }

  // ── Estados de carga / error ──────────────────────────────────────────────
  if (loadingEntity) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <svg className="animate-spin w-8 h-8 text-brand" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    )
  }

  if (invalidToken) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-display text-xl font-bold text-white mb-2">Enlace inválido o caducado</h2>
          <p className="text-gray-400 text-sm mb-6">
            Este enlace de invitación no es válido, ya ha sido usado o ha caducado (validez: 7 días).
            Pide a tu empresa o centro que genere un nuevo código QR desde su panel de configuración.
          </p>
          <a href="/" className="btn-secondary block w-full text-center">Volver al inicio</a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center p-4">
        <div className="bg-dark-800 border border-white/10 rounded-2xl w-full max-w-md p-10 text-center">
          <div className="text-6xl mb-5">🎉</div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">¡Ya eres parte del equipo!</h2>
          <p className="text-gray-400 text-sm mb-2">Tu cuenta de tutor ha sido creada y enlazada con:</p>
          <p className="text-brand font-semibold text-lg mb-6">{entityInfo?.name}</p>
          <p className="text-gray-500 text-xs mb-8">Revisa tu correo para verificar tu cuenta.</p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">Ir al inicio</button>
        </div>
      </div>
    )
  }

  const entityLabel = entityType === 'empresa' ? 'empresa' : 'centro educativo'
  const roleLabel = entityType === 'empresa' ? 'tutor de empresa' : 'tutor de centro educativo'

  return (
    <div className="min-h-screen bg-dark py-12 px-4">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-8">
          <a href="/"><img src={logoUrl} alt="Relance" className="h-9 rounded-md mx-auto mb-6" /></a>
        </div>

        {/* Banner de invitación */}
        <div className="bg-brand/10 border border-brand/25 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <span className="text-3xl flex-shrink-0">👋</span>
          <div>
            <p className="text-white font-semibold font-display">Invitación de {entityInfo?.name}</p>
            <p className="text-gray-400 text-sm mt-1">
              Estás a punto de crear tu cuenta como <strong className="text-brand">{roleLabel}</strong> vinculado a esta {entityLabel}.
            </p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-dark-800 border border-white/10 rounded-2xl p-6 sm:p-8">
          <h1 className="font-display text-2xl font-bold text-white mb-6">Completa tu registro</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Nombre completo *</label>
              <input type="text" required value={form.fullName} onChange={s('fullName')} placeholder="Tu nombre y apellidos" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Correo electrónico *</label>
              <input type="email" required value={form.email} onChange={s('email')} placeholder="tutor@correo.com" className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Contraseña *</label>
              <PasswordField value={form.password} onChange={s('password')} />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Confirmar contraseña *</label>
              <input type="password" required value={form.confirmPassword} onChange={s('confirmPassword')} placeholder="Repite la contraseña" className="input-field" />
              {form.confirmPassword && form.confirmPassword !== form.password && <p className="text-xs text-red-400 mt-1">No coinciden</p>}
              {form.confirmPassword && form.confirmPassword === form.password && form.password.length >= 8 && <p className="text-xs text-brand mt-1">✓ Coinciden</p>}
            </div>

            <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Información adicional</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Teléfono</label>
                  <input type="tel" value={form.phone} onChange={s('phone')} placeholder="+34 600 000 000" className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Especialidad / Área</label>
                  <input type="text" value={form.specialty} onChange={s('specialty')} placeholder="Ej: Desarrollo Web" className="input-field" />
                </div>
              </div>
            </div>

            {/* Entidad vinculada (solo lectura) */}
            <div className="bg-dark border border-white/8 rounded-xl p-3 flex items-center gap-3">
              <span className="text-xl">{entityType === 'empresa' ? '🏢' : '🏫'}</span>
              <div>
                <p className="text-xs text-gray-500">Vinculado a</p>
                <p className="text-sm text-white font-semibold">{entityInfo?.name}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-brand/20 text-brand px-2 py-0.5 rounded-full">Verificado</span>
              </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>}

            <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center gap-2 py-3.5 text-base disabled:opacity-50">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creando cuenta...
                </>
              ) : `Registrarme como ${roleLabel}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
