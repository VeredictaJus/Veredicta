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
import AnimatedBackground from '@/components/ui/AnimatedBackground'

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
      <AnimatedBackground />

      {/* Overlays: mantém os caracteres, mas escurece o fundo e aplica degradê laranja */}
      <div aria-hidden className="fixed inset-0 z-[1] bg-slate-950/55" />
      <div
        aria-hidden
        className="fixed inset-0 z-[2] bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.26),transparent_55%)]"
      />
      <div
        aria-hidden
        className="fixed inset-0 z-[3] bg-[radial-gradient(circle_at_bottom,rgba(255,255,255,0.08),transparent_55%)]"
      />

      <Card className="w-full max-w-md relative z-10 bg-white/90 shadow-xl border border-gray-200 dark:bg-white dark:border-gray-200">
        <CardHeader className="text-center items-center bg-white dark:bg-white">
          <div className="flex justify-center mb-4">
            <Logo size="xl" clickable={true} textColor="dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
          <CardDescription className="text-gray-600">Entre na sua conta Veredicta</CardDescription>
        </CardHeader>

        <CardContent className="bg-white dark:bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="userType" className="text-gray-900">Tipo de Usuário</Label>
              <Select value={formData.userType} onValueChange={handleUserTypeChange}>
                <SelectTrigger disabled={loading} className="bg-white border-gray-300 text-gray-900">
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem
                    value="client"
                    className="bg-white hover:bg-orange-50 data-[state=checked]:bg-[#FF9E7A] data-[state=checked]:text-white data-[highlighted]:bg-[#FFB995] data-[highlighted]:text-white"
                  >
                    <span className="text-gray-950 font-medium">Cliente</span>
                  </SelectItem>
                  <SelectItem
                    value="writer"
                    className="bg-white hover:bg-orange-50 data-[state=checked]:bg-[#FF9E7A] data-[state=checked]:text-white data-[highlighted]:bg-[#FFB995] data-[highlighted]:text-white"
                  >
                    <span className="text-gray-950 font-medium">Redator</span>
                  </SelectItem>
                  <SelectItem
                    value="admin"
                    className="bg-white hover:bg-orange-50 data-[state=checked]:bg-[#FF9E7A] data-[state=checked]:text-white data-[highlighted]:bg-[#FFB995] data-[highlighted]:text-white"
                  >
                    <span className="text-gray-950 font-medium">Administrador</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-900">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-900">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pr-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                  placeholder="Sua senha"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent bg-transparent text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleClient}
              disabled={loading}
              className="w-full border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:text-gray-900"
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
                <span className="text-gray-600">Não tem uma conta? </span>
                <Link to="/auth/register" className="text-orange-600 hover:text-orange-800 font-medium">
                  Cadastre-se aqui
                </Link>
              </p>
              <p>
                <span className="text-gray-600">Esqueceu a senha? </span>
                <Link to="/auth/forgot-password" className="text-orange-600 hover:text-orange-800 font-medium">
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