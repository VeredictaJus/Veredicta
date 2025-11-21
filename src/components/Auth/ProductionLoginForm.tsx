// src/components/Auth/ProductionLoginForm.tsx
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useProductionAuth } from '@/contexts/ProductionAuthContext'
import Logo from '@/components/ui/Logo'

export default function ProductionLoginForm() {
  const { login } = useProductionAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    if (success) setSuccess('')
  }

  const handleUserTypeChange = (value: string) => {
    setFormData({ ...formData, userType: value as 'client' | 'writer' | 'admin' })
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!formData.userType) {
        throw new Error('Por favor, selecione o tipo de usuário')
      }
      
      const email = formData.email.trim().toLowerCase()
      console.log('🚀 Iniciando login de produção...')
      
      await login(email, formData.password, formData.userType)
      
      setSuccess('Login realizado com sucesso! Redirecionando...')
      console.log('✅ Login de produção concluído')
      
    } catch (err: any) {
      console.error('❌ Erro no login:', err)
      setError(err?.message || 'Erro desconhecido no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="text-center items-center">
          <div className="flex justify-center mb-4">
            <Logo size="xl" clickable={false} textColor="dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Login</CardTitle>
          <CardDescription className="text-gray-600">
            Sistema de autenticação de produção
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="userType">Tipo de Usuário</Label>
              <Select value={formData.userType} onValueChange={handleUserTypeChange}>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    value="client"
                    className="bg-white hover:bg-orange-50"
                  >
                    <span className="text-gray-950 font-medium">Cliente</span>
                  </SelectItem>
                  <SelectItem 
                    value="writer"
                    className="bg-white hover:bg-orange-50"
                  >
                    <span className="text-gray-950 font-medium">Redator</span>
                  </SelectItem>
                  <SelectItem 
                    value="admin"
                    className="bg-white hover:bg-orange-50"
                  >
                    <span className="text-gray-950 font-medium">Administrador</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
                  className="pl-10"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pr-10"
                  placeholder="Sua senha"
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
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

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Sistema de Produção:</strong> Autenticação robusta com fallbacks automáticos
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
