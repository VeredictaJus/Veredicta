// src/components/auth/NewLoginForm.tsx
import React, { useState, useEffect, useRef } from 'react'
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

export default function NewLoginForm() {
  const navigate = useNavigate()
  const { login, loginWithGoogleClient } = useNewAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

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
      await loginWithGoogleClient()
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

  // Pergaminho Digital com Texto Neon - Veredicta
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    
    // Fundo pergaminho - laranja mais vivo e vibrante
    const createParchmentGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#FF6600') // Laranja vibrante
      gradient.addColorStop(0.3, '#FF7A1A') // Laranja médio
      gradient.addColorStop(0.7, '#FF6600')
      gradient.addColorStop(1, '#E55A00') // Laranja mais escuro
      return gradient
    }

    // Textura de papel sutil
    const paperTexture = []
    for (let i = 0; i < 200; i++) {
      paperTexture.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.1 + 0.02,
        speed: Math.random() * 0.2 + 0.1,
        direction: Math.random() * Math.PI * 2
      })
    }

    // Linhas de texto neon
    const neonLines = []
    const lineCount = Math.floor(canvas.height / 25) // Uma linha a cada 25px
    
    // Símbolos elegantes e sofisticados
    const elegantIcons = [
      '§', '¶', '(...)', '[ ]', '{ }', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'
    ]
    
    const visualElements = elegantIcons.map(icon => ({ type: 'symbol', icon: icon }))

    // Criar linhas de texto com duplicação para scroll contínuo
    const totalLines = lineCount + Math.floor(canvas.height / 25) // Duplicar linhas para scroll infinito
    
    for (let i = 0; i < totalLines; i++) {
      const lineLength = Math.random() * (canvas.width * 0.8) + (canvas.width * 0.2)
      const characters = []
      
      for (let j = 0; j < Math.floor(lineLength / 20); j++) {
        const element = visualElements[Math.floor(Math.random() * visualElements.length)]
        characters.push({
          element: element,
          x: j * 20 + Math.random() * 15,
          y: i * 25 + Math.random() * 10,
          opacity: 0,
          targetOpacity: Math.random() * 0.4 + 0.2, // Símbolos transparentes
          writingSpeed: Math.random() * 0.02 + 0.01, // Aparecem mais devagar
          erasingSpeed: Math.random() * 0.015 + 0.005, // Desaparecem mais devagar
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: Math.random() * 0.01 + 0.005,
          state: Math.random() < 0.5 ? 'writing' : 'waiting', // writing, waiting, erasing
          timer: Math.random() * 2000,
          maxTimer: 2000 + Math.random() * 3000
        })
      }
      
      neonLines.push({
        characters: characters,
        scrollOffset: i * 25,
        scrollSpeed: 0.5 + Math.random() * 0.3
      })
    }

    let animationTime = 0
    let globalScrollOffset = 0

    const animate = () => {
      // Fundo pergaminho
      ctx.fillStyle = createParchmentGradient()
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Textura de papel sutil
      paperTexture.forEach(particle => {
        particle.x += Math.cos(particle.direction) * particle.speed
        particle.y += Math.sin(particle.direction) * particle.speed
        
        if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
          particle.direction = Math.random() * Math.PI * 2
        }
        
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Atualizar scroll global - movimento contínuo infinito
      globalScrollOffset += 0.8 // Velocidade um pouco mais rápida
      
      // Reset quando completar um ciclo completo
      const maxScroll = (totalLines * 25) + canvas.height
      if (globalScrollOffset > maxScroll) {
        globalScrollOffset = 0
      }

      // Desenhar linhas de texto neon
      neonLines.forEach((line, lineIndex) => {
        line.characters.forEach((char, charIndex) => {
          char.timer++
          char.phase += char.phaseSpeed
          
          // Lógica de estados: waiting -> writing -> waiting -> erasing
          if (char.state === 'waiting' && char.timer > char.maxTimer) {
            char.state = 'writing'
            char.timer = 0
          } else if (char.state === 'writing' && char.opacity >= char.targetOpacity) {
            char.state = 'waiting'
            char.timer = 0
            char.maxTimer = 1000 + Math.random() * 2000
          } else if (char.state === 'waiting' && char.timer > char.maxTimer) {
            char.state = 'erasing'
            char.timer = 0
          } else if (char.state === 'erasing' && char.opacity <= 0) {
            char.state = 'waiting'
            char.timer = 0
            char.maxTimer = 1000 + Math.random() * 2000
            char.element = visualElements[Math.floor(Math.random() * visualElements.length)]
          }
          
          // Atualizar opacidade baseada no estado
          if (char.state === 'writing') {
            char.opacity = Math.min(char.targetOpacity, char.opacity + char.writingSpeed)
          } else if (char.state === 'erasing') {
            char.opacity = Math.max(0, char.opacity - char.erasingSpeed)
          }
          
          // Calcular posição com scroll contínuo
          const y = char.y - globalScrollOffset
          
          // Desenhar se estiver na tela (com margem para transição suave)
          if (y > -50 && y < canvas.height + 50 && char.opacity > 0) {
            // Efeito de pulsação sutil
            const pulse = Math.sin(char.phase) * 0.1 + 0.9
            const finalOpacity = char.opacity * pulse
            
            // Efeito neon sutil para ícones
            ctx.shadowColor = 'rgba(255, 102, 0, 0.2)'
            ctx.shadowBlur = 6
            
            // Cor e tamanho para símbolos elegantes
            const iconColor = `rgba(255, 200, 100, ${finalOpacity})` // Dourado elegante
            const fontSize = '14px' // Tamanho menor para símbolos mais complexos
            
            ctx.fillStyle = iconColor
            ctx.font = `${fontSize} Arial`
            ctx.textAlign = 'center'
            
            // Efeito de pulsação sutil para símbolos
            const pulseEffect = Math.sin(char.phase * 2) * 0.2 + 0.8 // Pulsação mais suave
            ctx.fillStyle = `rgba(255, 200, 100, ${finalOpacity * pulseEffect})`
            
            ctx.fillText(char.element.icon, char.x, y + 5)
          }
        })
      })

      // Limpar sombras
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0

      // Efeito de brilho global sutil
      const globalGlow = Math.sin(animationTime * 0.002) * 0.05 + 0.95
      ctx.fillStyle = `rgba(255, 102, 0, ${0.01 * globalGlow})`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      animationTime++
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      
      // Reposicionar textura para nova tela
      paperTexture.forEach(particle => {
        if (particle.x > canvas.width) particle.x = canvas.width - 50
        if (particle.y > canvas.height) particle.y = canvas.height - 50
      })
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-gray-50" onKeyDown={handleKeyDown}>
      <canvas ref={canvasRef} className="fixed inset-0 w-full h-full z-0" />

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
              className="w-full border-gray-300 text-gray-900 hover:bg-gray-50"
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