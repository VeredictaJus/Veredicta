// src/components/auth/NewLoginForm.tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Chrome, Loader2, Mail, Eye, EyeOff } from 'lucide-react'
import { useNewAuth } from '@/contexts/NewAuthContext'
import Logo from '@/components/ui/Logo'
import FloatingLegalBackground from '@/components/ui/FloatingLegalBackground'

export default function NewLoginForm() {
  const navigate = useNavigate()
  const { login, loginWithGoogleClientExistingOnly } = useNewAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [formData, setFormData] = useState<{
    email: string
    password: string
    userType: 'client' | 'writer' | 'admin' | ''
  }>({
    email: '',
    password: '',
    userType: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleUserTypeChange = (value: string) => {
    setFormData({ ...formData, userType: value as 'client' | 'writer' | 'admin' })
    if (error) setError('')
  }

  const mapError = (message: string) => {
    // mensagens comuns do Firebase Auth
    if (message.includes('auth/invalid-credential') || message.includes('wrong-password')) {
      return 'Email ou senha inválidos.'
    }
    if (message.includes('user-not-found')) {
      return 'Usuário não encontrado.'
    }
    if (message.includes('too-many-requests')) {
      return 'Muitas tentativas. Tente novamente em instantes.'
    }
    return 'Erro no login'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setError('')
    setLoading(true)

    try {
      if (!formData.userType) throw new Error('Por favor, selecione o tipo de usuário')
      const email = formData.email.trim().toLowerCase()
      await login(email, formData.password, formData.userType)
      // redirecionamento é feito pelo contexto
    } catch (err: any) {
      console.error('Login error:', err)
      setError(mapError(err?.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleClient = async () => {
    if (loading) return
    setError('')
    setLoading(true)
    try {
      await loginWithGoogleClientExistingOnly()
      navigate('/client', { replace: true })
    } catch (err: any) {
      console.error('Google login error:', err)
      setError(err?.message || 'Erro no login com Google')
    } finally {
      setLoading(false)
    }
  }

  // Enter para enviar (acessibilidade)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const target = e.target as HTMLElement
      const isButton = target.tagName.toLowerCase() === 'button'
      if (!isButton) handleSubmit(e as any)
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center bg-slate-950 py-12 px-4 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
    >
      <FloatingLegalBackground />

      <div aria-hidden className="fixed inset-0 z-[1] bg-slate-950/58" />
      <div
        aria-hidden
        className="fixed inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.18),transparent_55%)]"
      />
      <div
        aria-hidden
        className="fixed inset-0 z-[3] bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.14),transparent_55%)]"
      />

      <Card className="w-full max-w-md relative z-10 rounded-2xl border border-[rgba(125,211,252,0.15)] bg-[linear-gradient(135deg,rgba(30,64,175,0.12),rgba(30,58,138,0.08))] shadow-[0_8px_32px_rgba(2,6,23,0.55),inset_0_1px_0_rgba(255,255,255,0.10)] supports-[backdrop-filter]:backdrop-blur-[24px] supports-[backdrop-filter]:backdrop-saturate-[1.2]">
        <CardHeader className="text-center items-center px-8 pt-8 pb-4 md:px-10 md:pt-10">
          <div className="flex justify-center mb-4">
            <Logo size="xl" clickable={true} textColor="dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-100">Login</CardTitle>
          <CardDescription className="text-sky-300/80">Entre na sua conta Veredicta</CardDescription>
        </CardHeader>

        <CardContent className="px-8 pb-8 md:px-10 md:pb-10 pt-0">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="userType" className="text-slate-200">Tipo de Usuário</Label>
              <Select value={formData.userType} onValueChange={handleUserTypeChange}>
                <SelectTrigger disabled={loading} className="bg-slate-900/45 border-white/10 text-slate-100 placeholder:text-slate-400">
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-950/95 text-slate-100 supports-[backdrop-filter]:backdrop-blur-md">
                  <SelectItem
                    value="client"
                    className="data-[state=checked]:bg-orange-500/70 data-[state=checked]:text-white data-[highlighted]:bg-slate-800"
                  >
                    <span className="font-medium">Cliente</span>
                  </SelectItem>
                  <SelectItem
                    value="writer"
                    className="data-[state=checked]:bg-orange-500/70 data-[state=checked]:text-white data-[highlighted]:bg-slate-800"
                  >
                    <span className="font-medium">Redator</span>
                  </SelectItem>
                  <SelectItem
                    value="admin"
                    className="data-[state=checked]:bg-orange-500/70 data-[state=checked]:text-white data-[highlighted]:bg-slate-800"
                  >
                    <span className="font-medium">Administrador</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-200">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 bg-slate-900/45 border-white/10 text-slate-100 placeholder:text-slate-400"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pr-10 bg-slate-900/45 border-white/10 text-slate-100 placeholder:text-slate-400"
                  placeholder="Sua senha"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent bg-transparent text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleClient}
              disabled={loading}
              className="w-full border-white/10 bg-slate-900/45 text-slate-100 hover:bg-slate-900/65 hover:text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <Chrome className="mr-2 h-4 w-4" />
                  Entrar com Google (Cliente)
                </>
              )}
            </Button>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>

            <div className="text-center text-sm space-y-1">
              <p>
                <span className="text-slate-300">Não tem uma conta? </span>
                <Link to="/auth/register" className="text-orange-400 hover:text-orange-300 font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
              <p>
                <span className="text-slate-300">Esqueceu a senha? </span>
                <Link to="/auth/forgot-password" className="text-orange-400 hover:text-orange-300 font-medium">
                  Redefinir aqui
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}