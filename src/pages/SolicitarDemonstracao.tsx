import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckCircle, AlertCircle, ShieldCheck, Clock, Sparkles } from 'lucide-react'
import { EmailService } from '@/services/emailService'
import { PUBLIC_PAGE_CLASS } from '@/styles/publicPage'
import MarketingHero from '@/components/Marketing/MarketingHero'
import {
  MARKETING_CARD_CLASS,
  MARKETING_CARD_HOVER_CLASS,
  MARKETING_FIELD_CLASS,
  MARKETING_SECTION_ALT_CLASS,
  MARKETING_SECTION_CLASS,
} from '@/styles/marketing'

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

  const whatsappUrl = buildDemoWhatsAppUrl({ ...formData, utm })

  const scrollToForm = () => {
    const el = document.getElementById('demo-form')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className={`min-h-screen ${PUBLIC_PAGE_CLASS}`}>
      <MarketingHero
        eyebrow="Demonstração"
        title={
          <>
            Solicite uma demonstração da{' '}
            <span className="bg-gradient-to-r from-orange-200 via-orange-400 to-orange-500 bg-clip-text text-transparent">
              Veredicta
            </span>
          </>
        }
        subtitle={
          <>
            Escale a produção de petições com padrão, previsibilidade e apoio humano.
            <br />
            Em poucos minutos, você entende o fluxo e se faz sentido para sua operação.
          </>
        }
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.18)]"
            onClick={scrollToForm}
          >
            Solicitar demonstração
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
          >
            Falar no WhatsApp
          </Button>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-slate-300">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2">
            <Clock className="w-4 h-4 text-orange-300" />
            <span className="text-sm">Duração média: 20 min</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2">
            <Sparkles className="w-4 h-4 text-orange-300" />
            <span className="text-sm">Sem compromisso</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2">
            <ShieldCheck className="w-4 h-4 text-orange-300" />
            <span className="text-sm">LGPD e confidencialidade</span>
          </div>
        </div>
      </MarketingHero>

      <section className={MARKETING_SECTION_CLASS}>
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
            {/* Left */}
            <div className="space-y-6">
              <Card className={[MARKETING_CARD_CLASS].join(' ')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ShieldCheck className="h-5 w-5 text-orange-300" />
                    Para quem é a demonstração
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    Atendemos operações jurídicas com demanda recorrente e necessidade de padrão.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      'Escritórios de advocacia com volume contínuo',
                      'Departamentos jurídicos e equipes internas',
                      'Prazos frequentes e necessidade de previsibilidade',
                      'Padronização e revisão técnica antes da entrega',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3 text-slate-300">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className={[MARKETING_CARD_CLASS, MARKETING_CARD_HOVER_CLASS].join(' ')}>
                <CardHeader>
                  <CardTitle className="text-white">O que você verá na demonstração</CardTitle>
                  <CardDescription className="text-slate-300">
                    Um overview rápido do fluxo, dos padrões e do modelo de operação.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-slate-300">
                    {[
                      'Como funciona a produção de petições sob demanda',
                      'Como garantimos padrão e qualidade com revisão técnica',
                      'Como acompanhar prazos e entregas pelo fluxo',
                      'Como escalar mantendo previsibilidade',
                      'Próximos passos (e, se aplicável, peça piloto para testar o fluxo)',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 text-orange-300">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-slate-300 text-sm leading-relaxed">
                  Se você não tiver e-mail corporativo, pode solicitar pelo WhatsApp. Nós coletamos apenas o necessário
                  para responder e orientar os próximos passos.
                </p>
              </div>
            </div>

            {/* Form */}
            <Card id="demo-form" className={[MARKETING_CARD_CLASS, 'shadow-2xl'].join(' ')}>
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white">Solicitar demonstração</CardTitle>
                <CardDescription className="text-slate-300">
                  Preencha os dados abaixo. Retornamos com orientação e próximos passos.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {submitStatus.type && (
                  <div
                    className={[
                      'p-4 rounded-xl mb-6 flex items-center gap-3 border',
                      submitStatus.type === 'success'
                        ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-200 border-red-500/20',
                    ].join(' ')}
                  >
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-300" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-300" />
                    )}
                    <span className="text-sm font-medium">{submitStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-slate-200">Nome completo</Label>
                    <Input
                      className={MARKETING_FIELD_CLASS}
                      value={formData.nome}
                      onChange={(e) => setFormData((s) => ({ ...s, nome: e.target.value }))}
                      required
                      placeholder="Seu nome completo"
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Email corporativo</Label>
                    <Input
                      className={MARKETING_FIELD_CLASS}
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                      required
                      placeholder="nome@empresa.com.br"
                      autoComplete="email"
                    />
                    <p className="text-xs text-slate-400">
                      Preferimos e-mail corporativo. Se você não tiver, solicite pelo WhatsApp abaixo.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Celular (WhatsApp)</Label>
                    <Input
                      className={MARKETING_FIELD_CLASS}
                      type="tel"
                      value={formData.celular}
                      onChange={(e) => setFormData((s) => ({ ...s, celular: formatBrazilPhone(e.target.value) }))}
                      placeholder="(11) 91234-5678"
                      autoComplete="tel"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Escritório / Empresa</Label>
                    <Input
                      className={MARKETING_FIELD_CLASS}
                      value={formData.empresa}
                      onChange={(e) => setFormData((s) => ({ ...s, empresa: e.target.value }))}
                      required
                      placeholder="Nome do escritório/empresa"
                      autoComplete="organization"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-200">Cargo</Label>
                    <Input
                      className={MARKETING_FIELD_CLASS}
                      value={formData.cargo}
                      onChange={(e) => setFormData((s) => ({ ...s, cargo: e.target.value }))}
                      required
                      placeholder="Ex.: Sócio, Coordenador, Advogado(a)"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-200">Volume médio mensal de petições</Label>
                    <RadioGroup
                      value={formData.volume}
                      onValueChange={(v) => setFormData((s) => ({ ...s, volume: v as VolumeOption }))}
                      className="gap-3"
                    >
                      {(['ate_20', '21_50', '51_100', 'mais_100'] as VolumeOption[]).map((v) => (
                        <div
                          key={v}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.07] transition-colors p-3"
                        >
                          <RadioGroupItem value={v} id={v} />
                          <Label htmlFor={v} className="cursor-pointer text-slate-200">
                            {volumeLabel(v)}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-[0_10px_30px_rgba(249,115,22,0.16)]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Solicitar demonstração'}
                  </Button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center rounded-xl border border-white/15 text-white hover:bg-white/10 py-2 font-medium transition-colors"
                  >
                    Solicitar pelo WhatsApp
                  </a>

                  <p className="text-sm text-slate-300">
                    Nossa equipe entrará em contato para entender sua necessidade e orientar os próximos passos.
                  </p>

                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => navigate('/privacidade')}
                      className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      Ao solicitar, você concorda com nossa Política de Privacidade.
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className={MARKETING_SECTION_ALT_CLASS}>
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-3">
                Prefere começar agora?
              </h2>
              <p className="text-lg text-slate-300 mb-6">
                Crie sua conta e conheça a plataforma. Se fizer sentido, a demonstração aprofunda no fluxo e na operação.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white"
                  onClick={() => navigate('/auth/register')}
                >
                  Cadastrar-se
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  onClick={() => window.open(whatsappUrl, '_blank', 'noopener,noreferrer')}
                >
                  Falar com especialista
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


