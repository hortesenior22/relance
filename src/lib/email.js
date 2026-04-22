/**
 * lib/email.js
 * 
 * Utilidad para enviar emails transaccionales desde el frontend.
 * Llama a la Supabase Edge Function `send-email` que usa Resend (o cualquier
 * proveedor SMTP) en el servidor. El HTML lo genera React Email en el cliente
 * y se manda como string al edge function.
 *
 * ARQUITECTURA:
 *   Frontend (React) → render email HTML → POST /functions/v1/send-email → Resend API
 *
 * SETUP (Supabase Edge Function):
 *   supabase functions new send-email
 *   # Ver: supabase/functions/send-email/index.ts (incluido más abajo como comentario)
 */

import { render } from '@react-email/render'
import { supabase } from './supabase'

// Re-exportamos los templates para uso externo
export { default as InviteEmail } from '../emails/InviteEmail'
export { default as ChangeEmailEmail } from '../emails/ChangeEmailEmail'
export { default as ResetPasswordEmail } from '../emails/ResetPasswordEmail'

/**
 * Envía un email renderizando el template de React Email en el cliente
 * y delegando el envío a la Supabase Edge Function `send-email`.
 *
 * @param {Object} options
 * @param {React.ReactElement} options.template  - Elemento JSX del email (e.g. <InviteEmail .../>)
 * @param {string} options.to                    - Dirección de destino
 * @param {string} options.subject               - Asunto del correo
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendEmail({ template, to, subject }) {
  try {
    // Renderizar el template a HTML
    const html = await render(template)

    // Llamar a la Edge Function de Supabase
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html },
    })

    if (error) throw new Error(error.message)
    return { success: true, data }
  } catch (err) {
    console.error('[sendEmail] Error:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Helpers específicos por tipo de email
 */

export async function sendInviteEmail({ to, inviterName, inviterType, inviteUrl }) {
  const { default: InviteEmail } = await import('../emails/InviteEmail')
  const roleLabel = inviterType === 'empresa' ? 'tutor de empresa' : 'tutor de centro educativo'
  return sendEmail({
    to,
    subject: `${inviterName} te invita a Relance como ${roleLabel}`,
    template: InviteEmail({ inviterName, inviterType, inviteUrl }),
  })
}

export async function sendChangeEmailEmail({ to, userName, newEmail, confirmUrl }) {
  const { default: ChangeEmailEmail } = await import('../emails/ChangeEmailEmail')
  return sendEmail({
    to,
    subject: 'Confirma tu nueva dirección de correo — Relance',
    template: ChangeEmailEmail({ userName, newEmail, confirmUrl }),
  })
}

export async function sendResetPasswordEmail({ to, userName, resetUrl }) {
  const { default: ResetPasswordEmail } = await import('../emails/ResetPasswordEmail')
  return sendEmail({
    to,
    subject: 'Restablece tu contraseña de Relance',
    template: ResetPasswordEmail({
      userName,
      resetUrl,
      requestedAt: new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
    }),
  })
}

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPABASE EDGE FUNCTION — supabase/functions/send-email/index.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Crea esta función con: supabase functions new send-email
 * Despliega con:         supabase functions deploy send-email
 *
 * Requiere la variable de entorno RESEND_API_KEY en el dashboard de Supabase
 * (Settings → Edge Functions → Environment Variables).
 *
 * ─── Código de la edge function ───────────────────────────────────────────────
 *
 * import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
 *
 * const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
 * const FROM_EMAIL = 'Relance <noreply@relance.app>'
 *
 * serve(async (req) => {
 *   if (req.method !== 'POST') {
 *     return new Response('Method Not Allowed', { status: 405 })
 *   }
 *
 *   const { to, subject, html } = await req.json()
 *
 *   if (!to || !subject || !html) {
 *     return new Response(JSON.stringify({ error: 'Missing fields' }), {
 *       status: 400, headers: { 'Content-Type': 'application/json' },
 *     })
 *   }
 *
 *   const res = await fetch('https://api.resend.com/emails', {
 *     method: 'POST',
 *     headers: {
 *       'Authorization': `Bearer ${RESEND_API_KEY}`,
 *       'Content-Type': 'application/json',
 *     },
 *     body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
 *   })
 *
 *   const data = await res.json()
 *
 *   return new Response(JSON.stringify(data), {
 *     status: res.status,
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Access-Control-Allow-Origin': '*',
 *     },
 *   })
 * })
 * ─────────────────────────────────────────────────────────────────────────────
 */
