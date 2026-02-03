import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Logo from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react'
import { EmailService } from '@/services/emailService'

type VolumeOption = 'ate_20' | '21_50' | '51_100' | 'mais_100'
const WHATSAPP_PHONE_NUMBER = '5544997271991' // (44) 99727-1991 sem caracteres especiais

function formatBrazilPhone(input: string): string {
  const digits = (input || '').replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  const ddd = digits.slice(0, 2)
  const rest = digits.slice(2)

  if (rest.length <= 4) return `(${ddd}) ${rest}`
  if (rest.length <= 8) return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`
  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`
}

function parseUtmParams(): Record<string, string> {
  const fromSearch = new URLSearchParams(window.location.search || '')
  const hash = window.location.hash || ''
  const qIndex = hash.indexOf('?')
  const fromHash = new URLSearchParams(qIndex >= 0 ? hash.slice(qIndex + 1) : '')

  const merged = new URLSearchParams()
  for (const [k, v] of fromSearch.entries()) merged.set(k, v)
  for (const [k, v] of fromHash.entries()) merged.set(k, v)
  return Object.fromEntries(merged.entries())
}

function volumeLabel(value: VolumeOption): string {
  switch (value) {
    case 'ate_20':
      return 'Até 20'
    case '21_50':
      return '21 a 50'
    case '51_100':
      return '51 a 100'
    case 'mais_100':
      return 'Mais de 100'
  }
}

function trackGoogleAdsConversion(): void {
  try {
    ;(window as any).gtag?.('event', 'conversion', {
      send_to: 'AW-17918868809/ijxICN3G_PEbEMn6sOBC',
    })
  } catch {
    // no-op: tracking não pode quebrar o funil
  }
}

function isCorporateEmail(email: string): boolean {
  const value = (email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return false
  const domain = value.split('@').pop() || ''

  // Bloquear provedores pessoais mais comuns (heurística)
  const blocked = new Set([
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'live.com',
    'icloud.com',
    'yahoo.com',
    'yahoo.com.br',
    'bol.com.br',
    'uol.com.br',
  ])

  return Boolean(domain) && !blocked.has(domain)
}

function buildDemoWhatsAppUrl(params: {
  nome: string
  email: string
  celular: string
  empresa: string
  cargo: string
  volume: VolumeOption | ''
  utm: Record<string, string>
}): string {
  const volumeText = params.volume ? volumeLabel(params.volume as VolumeOption) : '-'
  const utmParts = [
    params.utm.utm_source ? `utm_source=${params.utm.utm_source}` : null,
    params.utm.utm_medium ? `utm_medium=${params.utm.utm_medium}` : null,
    params.utm.utm_campaign ? `utm_campaign=${params.utm.utm_campaign}` : null,
    params.utm.utm_term ? `utm_term=${params.utm.utm_term}` : null,
    params.utm.utm_content ? `utm_content=${params.utm.utm_content}` : null,
  ].filter(Boolean)

  const message =
    `Olá! Gostaria de solicitar uma demonstração da Veredicta.\n\n` +
    `Nome: ${params.nome || '-'}\n` +
    `Email: ${params.email || '-'}\n` +
    `Celular: ${params.celular || '-'}\n` +
    `Escritório/Empresa: ${params.empresa || '-'}\n` +
    `Cargo: ${params.cargo || '-'}\n` +
    `Volume mensal de petições: ${volumeText}\n` +
    (utmParts.length ? `\nOrigem (UTM): ${utmParts.join(' | ')}` : '')

  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`
}

export default function SolicitarDemonstracao() {
  const navigate = useNavigate()
  const utm = useMemo(() => parseUtmParams(), [])

  // Forçar modo claro na página
  useEffect(() => {
    const root = document.documentElement
    const originalTheme = root.classList.contains('dark') ? 'dark' : 'light'

    root.classList.remove('dark')
    root.classList.add('light')

    return () => {
      root.classList.remove('light')
      if (originalTheme === 'dark') root.classList.add('dark')
    }
  }, [])

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    celular: '',
    empresa: '',
    cargo: '',
    volume: '' as VolumeOption | '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const emailTrim = formData.email.trim()

      if (!isCorporateEmail(emailTrim)) {
        setSubmitStatus({
          type: 'error',
          message:
            'Por favor, informe um e-mail corporativo válido (ex.: nome@escritorio.com.br). Se você não tiver, solicite pelo WhatsApp abaixo.',
        })
        return
      }

      if (!formData.volume) {
        setSubmitStatus({ type: 'error', message: 'Selecione o volume médio mensal de petições.' })
        return
      }

      const receivedAt = new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
          <h2 style="margin: 0 0 12px;">🟧 Novo lead — Solicitação de demonstração</h2>
          <p style="margin: 0 0 16px; color: #374151;">Recebido em: <strong>${receivedAt}</strong></p>

          <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px; background: #f9fafb;">
            <p style="margin: 0 0 6px;"><strong>Nome:</strong> ${formData.nome}</p>
            <p style="margin: 0 0 6px;"><strong>Email corporativo:</strong> ${emailTrim}</p>
            <p style="margin: 0 0 6px;"><strong>Celular:</strong> ${formData.celular || '-'}</p>
            <p style="margin: 0 0 6px;"><strong>Escritório/Empresa:</strong> ${formData.empresa}</p>
            <p style="margin: 0 0 6px;"><strong>Cargo:</strong> ${formData.cargo}</p>
            <p style="margin: 0;"><strong>Volume mensal de petições:</strong> ${volumeLabel(formData.volume as VolumeOption)}</p>
          </div>

          <h3 style="margin: 18px 0 8px;">Origem (UTM)</h3>
          <div style="border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px; background: #ffffff;">
            <p style="margin: 0 0 6px;"><strong>utm_source:</strong> ${utm.utm_source || '-'}</p>
            <p style="margin: 0 0 6px;"><strong>utm_medium:</strong> ${utm.utm_medium || '-'}</p>
            <p style="margin: 0 0 6px;"><strong>utm_campaign:</strong> ${utm.utm_campaign || '-'}</p>
            <p style="margin: 0;"><strong>utm_term / utm_content:</strong> ${(utm.utm_term || '-') + ' / ' + (utm.utm_content || '-')}</p>
          </div>
        </div>
      `

      const ok = await EmailService.sendEmail({
        to: 'contato@veredictajus.com',
        subject: `🟧 Solicitar demonstração — ${formData.empresa || 'Lead sem empresa'}`,
        html,
        replyTo: emailTrim,
      })

      if (!ok) {
        setSubmitStatus({
          type: 'error',
          message: 'Não foi possível enviar agora. Tente novamente em instantes ou solicite pelo WhatsApp abaixo.',
        })
        return
      }

      trackGoogleAdsConversion()
      ;(window as any).dataLayer?.push?.({
        event: 'demo_request_submitted',
        volume: formData.volume,
        utm_source: utm.utm_source || undefined,
        utm_medium: utm.utm_medium || undefined,
        utm_campaign: utm.utm_campaign || undefined,
      })

      setSubmitStatus({
        type: 'success',
        message: 'Solicitação enviada com sucesso! Nossa equipe entrará em contato para orientar os próximos passos.',
      })
      setFormData({ nome: '', email: '', celular: '', empresa: '', cargo: '', volume: '' })
    } catch {
      setSubmitStatus({ type: 'error', message: 'Erro inesperado. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Header */}
      <header className="bg-slate-900 shadow-lg">
        <div className="w-full px-6 lg:px-12 xl:px-16 py-4">
          <div className="flex flex-nowrap items-center justify-between w-full gap-2">
            <div className="flex items-center shrink-0 cursor-pointer" onClick={() => navigate('/')}>
              <Logo size="xl" clickable={false} textColor="light" />
            </div>
            <div className="flex flex-nowrap items-center gap-2 shrink-0 ml-auto">
              <Button
                variant="outline"
                className="bg-white text-slate-900 border-gray-300 hover:bg-gray-100 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/login')}
              >
                Entrar
              </Button>
              <Button
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
                onClick={() => navigate('/auth/register')}
              >
                Cadastrar-se
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-orange-600 to-orange-800">
        <div className="container mx-auto px-4 py-14">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Solicite uma demonstração da Veredicta</h1>
            <p className="text-lg md:text-xl text-orange-100">
              Tecnologia jurídica para escalar a produção de petições com apoio humano, padrão e previsibilidade.
            </p>

            <p className="mt-6 text-orange-100">
              A Veredicta apoia escritórios de advocacia, departamentos jurídicos e equipes jurídicas estruturadas que
              lidam com alta demanda de peças e prazos apertados.
              <br />
              Aqui você entende como a plataforma funciona na prática e avalia se faz sentido para a sua operação.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Left */}
            <div className="space-y-6">
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-orange-600" />
                    Atendemos exclusivamente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      'Advogados com alta demanda de petições',
                      'Escritórios de advocacia',
                      'Departamentos jurídicos',
                      'Equipes jurídicas com volume recorrente de petições',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-700">
                        <span className="mt-1 h-2 w-2 rounded-full bg-orange-600 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>O que você verá na demonstração</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-700">
                    {[
                      'Entender como funciona a produção de petições sob demanda',
                      'Ver como a Veredicta ajuda a manter padrão e qualidade',
                      'Avaliar se a solução se encaixa na rotina do seu escritório',
                      'Tirar dúvidas com a equipe',
                      'Após validação do cadastro, você pode receber uma petição gratuita para testar o fluxo na prática.',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 text-orange-600">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Solicite a demonstração</CardTitle>
                <CardDescription>Preencha os dados abaixo:</CardDescription>
              </CardHeader>
              <CardContent>
                {submitStatus.type && (
                  <div
                    className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
                      submitStatus.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{submitStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input
                      value={formData.nome}
                      onChange={(e) => setFormData((s) => ({ ...s, nome: e.target.value }))}
                      required
                      placeholder="Seu nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Email corporativo</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                      required
                      placeholder="nome@empresa.com.br"
                    />
                    <p className="text-xs text-gray-500">
                      Preferimos e-mail corporativo. Se você não tiver, pode solicitar a demonstração pelo WhatsApp no link abaixo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Celular (WhatsApp)</Label>
                    <Input
                      type="tel"
                      value={formData.celular}
                      onChange={(e) => setFormData((s) => ({ ...s, celular: formatBrazilPhone(e.target.value) }))}
                      placeholder="(11) 91234-5678"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Escritório / Empresa</Label>
                    <Input
                      value={formData.empresa}
                      onChange={(e) => setFormData((s) => ({ ...s, empresa: e.target.value }))}
                      required
                      placeholder="Nome do escritório/empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input
                      value={formData.cargo}
                      onChange={(e) => setFormData((s) => ({ ...s, cargo: e.target.value }))}
                      required
                      placeholder="Ex.: Sócio, Coordenador, Advogado(a)"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Volume médio mensal de petições</Label>
                    <RadioGroup
                      value={formData.volume}
                      onValueChange={(v) => setFormData((s) => ({ ...s, volume: v as VolumeOption }))}
                      className="gap-3"
                    >
                      {(['ate_20', '21_50', '51_100', 'mais_100'] as VolumeOption[]).map((v) => (
                        <div key={v} className="flex items-center gap-3 rounded-md border p-3">
                          <RadioGroupItem value={v} id={v} />
                          <Label htmlFor={v} className="cursor-pointer">
                            {volumeLabel(v)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : '👉 Solicitar demonstração'}
                  </Button>

                  <a
                    href={buildDemoWhatsAppUrl({ ...formData, utm })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center rounded-md border border-green-600 text-green-700 hover:bg-green-50 py-2 font-medium"
                  >
                    Solicitar pelo WhatsApp
                  </a>

                  <p className="text-sm text-gray-600">
                    Nossa equipe entrará em contato para entender sua necessidade e orientar os próximos passos.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}


