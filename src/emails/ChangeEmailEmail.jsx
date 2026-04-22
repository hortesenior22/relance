import {
  Html, Head, Body, Container, Section, Text, Button,
  Hr, Preview, Tailwind, Heading, Link
} from '@react-email/components'

const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://relance.app'

export default function ChangeEmailEmail({
  userName = 'Usuario',
  newEmail = 'nuevo@correo.com',
  confirmUrl = `${baseUrl}/confirm-email?token=EXAMPLE_TOKEN`,
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Confirma tu nueva dirección de correo electrónico en Relance</Preview>
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
                  ✉️
                </div>
              </Section>

              <Heading style={{ color: '#FFFFFF', fontSize: '24px', fontWeight: '700', textAlign: 'center', margin: '0 0 12px' }}>
                Confirma tu nuevo correo
              </Heading>

              <Text style={{ color: '#737373', fontSize: '15px', lineHeight: '1.6', textAlign: 'center', margin: '0 0 8px' }}>
                Hola <strong style={{ color: '#FFFFFF' }}>{userName}</strong>, has solicitado cambiar tu dirección de correo electrónico en Relance.
              </Text>

              <Text style={{ color: '#737373', fontSize: '15px', lineHeight: '1.6', textAlign: 'center', margin: '0 0 28px' }}>
                Tu nueva dirección será:{' '}
                <strong style={{ color: '#c0ff72' }}>{newEmail}</strong>
              </Text>

              {/* Info box */}
              <Section style={{
                background: 'rgba(192,255,114,0.06)', borderRadius: '10px',
                border: '1px solid rgba(192,255,114,0.15)', padding: '14px 18px', marginBottom: '28px',
              }}>
                <Text style={{ color: '#c0ff72', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>
                  ⚠️ Hasta que confirmes este cambio, seguirás accediendo con tu correo anterior.
                </Text>
              </Section>

              <Section style={{ textAlign: 'center', marginBottom: '28px' }}>
                <Button
                  href={confirmUrl}
                  style={{
                    background: '#c0ff72', color: '#0A0A0A',
                    fontWeight: '700', fontSize: '15px',
                    borderRadius: '10px', padding: '14px 32px',
                    textDecoration: 'none', display: 'inline-block',
                  }}
                >
                  Confirmar nueva dirección →
                </Button>
              </Section>

              <Hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px' }} />

              <Text style={{ color: '#525252', fontSize: '13px', textAlign: 'center', margin: '0 0 8px' }}>
                O copia este enlace en tu navegador:
              </Text>
              <Text style={{ margin: '0 0 20px' }}>
                <Link href={confirmUrl} style={{ color: '#c0ff72', fontSize: '12px', wordBreak: 'break-all' }}>
                  {confirmUrl}
                </Link>
              </Text>

              <Hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0 20px' }} />

              <Text style={{ color: '#525252', fontSize: '12px', textAlign: 'center', margin: 0, lineHeight: '1.5' }}>
                Si no has solicitado este cambio, ignora este correo. Tu cuenta no sufrirá ninguna modificación.
                Este enlace caduca en <strong style={{ color: '#737373' }}>24 horas</strong>.
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

ChangeEmailEmail.PreviewProps = {
  userName: 'Carlos Martínez',
  newEmail: 'carlos.nuevo@empresa.com',
  confirmUrl: 'https://relance.app/confirm-email?token=abc123xyz',
}
