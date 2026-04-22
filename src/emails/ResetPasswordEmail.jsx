import {
  Html, Head, Body, Container, Section, Text, Button,
  Hr, Preview, Tailwind, Heading, Link, Row, Column
} from '@react-email/components'

const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://relance.app'

export default function ResetPasswordEmail({
  userName = 'Usuario',
  resetUrl = `${baseUrl}/reset-password?token=EXAMPLE_TOKEN`,
  requestedAt = new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }),
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Restablece tu contraseña de Relance — enlace válido 1 hora</Preview>
      <Tailwind>
        <Body style={{ background: '#0A0A0A', fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}>
          <Container style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 20px' }}>

            {/* Logo */}
            <Section style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                display: 'inline-block', background: '#c0ff72',
                borderRadius: '10px', padding: '8px 20px',
              }}>
                <Text style={{ color: '#0A0A0A', fontWeight: '800', fontSize: '22px', margin: 0, letterSpacing: '-0.5px' }}>
                  Relance
                </Text>
              </div>
            </Section>

            {/* Card */}
            <Section style={{
              background: '#1A1A1A', borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.08)', padding: '40px 36px',
            }}>
              <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'rgba(192,255,114,0.12)', border: '1px solid rgba(192,255,114,0.25)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', margin: '0 auto',
                }}>
                  🔐
                </div>
              </Section>

              <Heading style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', textAlign: 'center', margin: '0 0 12px' }}>
                Restablecer contraseña
              </Heading>

              <Text style={{ color: '#737373', fontSize: '15px', lineHeight: '1.6', textAlign: 'center', margin: '0 0 28px' }}>
                Hola <strong style={{ color: '#FFFFFF' }}>{userName}</strong>. Recibimos una solicitud para restablecer
                la contraseña de tu cuenta. Haz clic en el botón de abajo para elegir una nueva.
              </Text>

              <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
                <Button
                  href={resetUrl}
                  style={{
                    background: '#c0ff72', color: '#0A0A0A',
                    fontWeight: '700', fontSize: '15px',
                    borderRadius: '10px', padding: '14px 32px',
                    textDecoration: 'none', display: 'inline-block',
                  }}
                >
                  Restablecer contraseña →
                </Button>
              </Section>

              {/* Info de seguridad */}
              <Section style={{
                background: 'rgba(255,255,255,0.03)', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px', marginBottom: '24px',
              }}>
                <Row>
                  <Column style={{ width: '20px', verticalAlign: 'top', paddingTop: '1px' }}>
                    <Text style={{ margin: 0, fontSize: '14px' }}>🕐</Text>
                  </Column>
                  <Column>
                    <Text style={{ color: '#737373', fontSize: '13px', margin: 0, lineHeight: '1.5', paddingLeft: '8px' }}>
                      Solicitado el <strong style={{ color: '#A0A0A0' }}>{requestedAt}</strong>
                      {' '}· Válido durante <strong style={{ color: '#A0A0A0' }}>1 hora</strong>
                    </Text>
                  </Column>
                </Row>
              </Section>

              <Hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px' }} />

              <Text style={{ color: '#525252', fontSize: '13px', textAlign: 'center', margin: '0 0 8px' }}>
                O copia este enlace en tu navegador:
              </Text>
              <Text style={{ margin: '0 0 20px' }}>
                <Link href={resetUrl} style={{ color: '#c0ff72', fontSize: '12px', wordBreak: 'break-all' }}>
                  {resetUrl}
                </Link>
              </Text>

              <Hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px' }} />

              {/* Aviso de seguridad */}
              <Section style={{
                background: 'rgba(239,68,68,0.06)', borderRadius: '10px',
                border: '1px solid rgba(239,68,68,0.15)', padding: '14px 18px',
              }}>
                <Text style={{ color: '#fca5a5', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                  🛡️ Si no has solicitado este restablecimiento, ignora este correo. Tu contraseña no cambiará hasta que hagas clic en el enlace. Si crees que tu cuenta puede estar comprometida, <Link href={`${baseUrl}/contacto`} style={{ color: '#f87171' }}>contáctanos</Link>.
                </Text>
              </Section>
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

ResetPasswordEmail.PreviewProps = {
  userName: 'Ana López',
  resetUrl: 'https://relance.app/reset-password?token=xyz789abc',
  requestedAt: '20 abr. 2026, 14:35',
}
