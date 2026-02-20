// src/components/ui/AnimatedBackground.tsx
import React, { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Fundo (dark) com leve nuance laranja para contraste com os símbolos
    const createParchmentGradient = () => {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#020617') // slate-950
      gradient.addColorStop(0.35, '#0b1220') // azul escuro (nuance)
      gradient.addColorStop(0.7, '#111827') // gray-900
      gradient.addColorStop(1, '#7c2d12') // orange-900
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
      
      // Reset suave quando completar um ciclo - garantindo continuidade perfeita
      const maxScroll = totalLines * 25
      if (globalScrollOffset >= maxScroll) {
        globalScrollOffset = globalScrollOffset % maxScroll // Reset modular para continuidade
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
          
          // Calcular posição com scroll contínuo - usando módulo para continuidade perfeita
          let y = char.y - globalScrollOffset
          
          // Garantir que elementos que saem por baixo aparecem por cima
          if (y < -50) {
            y += maxScroll
          }
          
          // Desenhar se estiver na tela (com margem para transição suave)
          if (y > -50 && y < canvas.height + 50 && char.opacity > 0) {
            // Efeito de pulsação sutil
            const pulse = Math.sin(char.phase) * 0.1 + 0.9
            const finalOpacity = char.opacity * pulse
            
            // Efeito neon sutil para ícones
            ctx.shadowColor = 'rgba(249, 115, 22, 0.25)'
            ctx.shadowBlur = 6
            
            // Cor e tamanho para símbolos elegantes
            const iconColor = `rgba(249, 115, 22, ${finalOpacity})` // Laranja (padrão Veredicta)
            const fontSize = '14px' // Tamanho menor para símbolos mais complexos
            
            ctx.fillStyle = iconColor
            ctx.font = `${fontSize} Arial`
            ctx.textAlign = 'center'
            
            // Efeito de pulsação sutil para símbolos
            const pulseEffect = Math.sin(char.phase * 2) * 0.2 + 0.8 // Pulsação mais suave
            ctx.fillStyle = `rgba(249, 115, 22, ${finalOpacity * pulseEffect})`
            
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
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
    />
  );
}