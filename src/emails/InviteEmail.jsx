import {
  Html, Head, Body, Container, Section, Img, Text, Button,
  Hr, Preview, Tailwind, Heading, Row, Column, Link
} from '@react-email/components'

const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://relance.app'

export default function InviteEmail({
  inviterName = 'Empresa Ejemplo S.L.',
  inviterType = 'empresa', // 'empresa' | 'centro_educativo'
  inviteUrl = `${baseUrl}/registro-tutor?token=EXAMPLE_TOKEN`,
  recipientName = 'Nuevo Tutor',
}) {
  const entityLabel = inviterType === 'empresa' ? 'empresa' : 'centro educativo'
  const roleLabel = inviterType === 'empresa' ? 'tutor de empresa' : 'tutor de centro educativo'

  return (
    <Html lang="es">
      <Head />
      <Preview>
        {inviterName} te invita a unirte a Relance como {roleLabel}
      </Preview>
      <Tailwind>
        <Body style={{ background: '#0A0A0A', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>

            {/* Logo */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                display: 'inline-block',
                background: '#c0ff72',
                borderRadius: '10px',
                padding: '8px 20px',
              }}>
                <Text style={{ color: '#0A0A0A', fontWeight: '800', fontSize: '22px', margin: 0, letterSpacing: '-0.5px' }}>
                  Relance
                </Text>
              </div>
            </Section>

            {/* Card principal */}
            <Section style={{
              background: '#1A1A1A',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '40px 36px',
            }}>
              {/* Icono */}
              <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'rgba(192,255,114,0.12)', border: '1px solid rgba(192,255,114,0.25)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', margin: '0 auto',
                }}>
                  👋
                </div>
              </Section>

              <Heading style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', textAlign: 'center', margin: '0 0 12px' }}>
                ¡Te han invitado a Relance!
              </Heading>

              <Text style={{ color: '#737373', fontSize: '15px', lineHeight: '1.6', textAlign: 'center', margin: '0 0 28px' }}>
                <strong style={{ color: '#c0ff72' }}>{inviterName}</strong> te invita a unirte a la plataforma como{' '}
                <strong style={{ color: '#FFFFFF' }}>{roleLabel}</strong>. Acepta la invitación para comenzar a gestionar las prácticas de tus estudiantes.
              </Text>

              <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
                <Button
                  href={inviteUrl}
                  style={{
                    background: '#c0ff72',
                    color: '#0A0A0A',
                    fontWeight: '700',
                    fontSize: '15px',
                    borderRadius: '10px',
                    padding: '14px 32px',
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Aceptar invitación →
                </Button>
              </Section>

              <Hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px' }} />

              <Text style={{ color: '#525252', fontSize: '13px', textAlign: 'center', margin: 0 }}>
                O copia este enlace en tu navegador:
              </Text>
              <Text style={{ margin: '8px 0 0' }}>
                <Link href={inviteUrl} style={{ color: '#c0ff72', fontSize: '12px', wordBreak: 'break-all' }}>
                  {inviteUrl}
                </Link>
              </Text>

              <Hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '20px 0' }} />

              <Text style={{ color: '#525252', fontSize: '12px', textAlign: 'center', margin: 0, lineHeight: '1.5' }}>
                Si no esperabas esta invitación, puedes ignorar este correo con seguridad.
                Este enlace caducará en <strong style={{ color: '#737373' }}>7 días</strong>.
              </Text>
            </Section>

            {/* Footer */}
            <Section style={{ textAlign: 'center', marginTop: '28px' }}>
              <Text style={{ color: '#404040', fontSize: '12px', margin: '0 0 4px' }}>
                © {new Date().getFullYear()} Relance · La plataforma de prácticas y primer empleo
              </Text>
              <Text style={{ color: '#404040', fontSize: '12px', margin: 0 }}>
                <Link href={`${baseUrl}/privacidad`} style={{ color: '#525252' }}>Privacidad</Link>
                {' · '}
                <Link href={`${baseUrl}/terminos`} style={{ color: '#525252' }}>Términos</Link>
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

InviteEmail.PreviewProps = {
  inviterName: 'TechCorp Solutions S.L.',
  inviterType: 'empresa',
  inviteUrl: 'https://relance.app/registro-tutor?token=abc123xyz',
  recipientName: 'María García',
}
