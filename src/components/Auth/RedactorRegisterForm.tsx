// src/components/redactor/RedactorRegisterForm.tsx
import React, { useState } from 'react'
import { Eye, EyeOff, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { useNewAuth } from '@/contexts/NewAuthContext'

// Lista de áreas do Direito (mesma que você já tinha)
const LAW_AREAS: { value: string; label: string }[] = [
  { value: "administrativo", label: "Direito Administrativo" },
  { value: "agrario", label: "Direito Agrário" },
  { value: "ambiental", label: "Direito Ambiental" },
  { value: "arbitragem_mediacao", label: "Arbitragem e Mediação" },
  { value: "bancario", label: "Direito Bancário" },
  { value: "civil", label: "Direito Civil" },
  { value: "consumidor", label: "Direito do Consumidor" },
  { value: "constitucional", label: "Direito Constitucional" },
  { value: "contratual", label: "Direito Contratual" },
  { value: "criminal", label: "Direito Penal / Criminal" },
  { value: "cibernetico_digital", label: "Direito Digital" },
  { value: "desportivo", label: "Direito Desportivo" },
  { value: "eleitoral", label: "Direito Eleitoral" },
  { value: "empresarial", label: "Direito Empresarial" },
  { value: "societario", label: "Direito Societário" },
  { value: "energia", label: "Direito da Energia" },
  { value: "familia_sucessoes", label: "Família e Sucessões" },
  { value: "falimentar_recuperacao", label: "Falimentar e Recuperação Judicial" },
  { value: "financeiro_capitais", label: "Financeiro e Mercado de Capitais" },
  { value: "imobiliario", label: "Direito Imobiliário" },
  { value: "internacional", label: "Direito Internacional" },
  { value: "lgpd_dados", label: "Proteção de Dados (LGPD)" },
  { value: "maritimo_portuario", label: "Marítimo e Portuário" },
  { value: "medico_saude", label: "Médico e da Saúde" },
  { value: "minerario", label: "Direito Minerário" },
  { value: "notarial_registral", label: "Notarial e Registral" },
  { value: "previdenciario", label: "Direito Previdenciário" },
  { value: "propriedade_intelectual", label: "Propriedade Intelectual" },
  { value: "regulatorio", label: "Direito Regulatório" },
  { value: "seguros_resseguros", label: "Seguros e Resseguros" },
  { value: "telecom", label: "Telecomunicações" },
  { value: "trabalhista", label: "Direito Trabalhista" },
  { value: "tributario", label: "Direito Tributário" },
  { value: "urbanistico", label: "Direito Urbanístico" },
  { value: "concorrencial", label: "Concorrencial / Antitruste" },
  { value: "comercio_exterior", label: "Comércio Exterior / Aduaneiro" },
  { value: "compliance_anticorrupcao", label: "Compliance e Anticorrupção" },
  { value: "transportes_logistica", label: "Transportes e Logística" },
  { value: "petroleo_gas", label: "Petróleo e Gás" },
  { value: "agronegocio", label: "Direito do Agronegócio" },
  { value: "educacao", label: "Educação" },
  { value: "cultura_entretenimento", label: "Cultura e Entretenimento" },
]

interface RedactorFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  oab: string
  specialty: string
  petitions: File[]
}

interface PetitionUploadProps {
  onPetitionsChange: (petitions: File[]) => void
  petitions: File[]
}

const PetitionUpload: React.FC<PetitionUploadProps> = ({ onPetitionsChange, petitions }) => {
  const handleFileChange = (index: number, file: File | null) => {
    const newPetitions = [...petitions]
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Apenas arquivos PDF são permitidos')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('Arquivo deve ter no máximo 5MB')
        return
      }
      newPetitions[index] = file
    } else {
      newPetitions.splice(index, 1)
    }
    onPetitionsChange(newPetitions)
  }

  const petitionSlots = [
    { id: 'petition1', label: 'Petição Autoral 1' },
    { id: 'petition2', label: 'Petição Autoral 2' },
    { id: 'petition3', label: 'Petição Autoral 3' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Petições Autorais</h3>
        <p className="text-sm text-gray-600 mb-4">
          Faça o upload de 3 petições de sua autoria para análise e aprovação (PDF, máx. 5MB cada).
        </p>
      </div>

      {petitionSlots.map((slot, index) => (
        <div key={slot.id} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{slot.label}</p>
                {petitions[index] ? (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <p className="text-xs text-green-600">{petitions[index].name}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">Nenhum arquivo selecionado</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => handleFileChange(index, e.target.files?.[0] || null)}
                className="hidden"
                id={slot.id}
              />
              <label
                htmlFor={slot.id}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                {petitions[index] ? 'Alterar' : 'Selecionar'}
              </label>
              {petitions[index] && (
                <button
                  type="button"
                  onClick={() => handleFileChange(index, null)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remover
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {petitions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-2" />
            <p className="text-sm text-blue-800">
              {petitions.length} de 3 petições carregadas.
              {petitions.length === 3 && ' Todas as petições foram carregadas com sucesso!'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export const RedactorRegisterForm: React.FC = () => {
  const { register: registerUser, getClient } = useNewAuth()

  const [formData, setFormData] = useState<RedactorFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    oab: '',
    specialty: '',
    petitions: [],
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Partial<RedactorFormData>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<RedactorFormData> = {}
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório'
    if (!formData.password) newErrors.password = 'Senha é obrigatória'
    if (formData.password.length < 6) newErrors.password = 'A senha deve ter pelo menos 6 caracteres'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
    if (!formData.oab.trim()) newErrors.oab = 'Número da OAB é obrigatório'
    if (!formData.specialty.trim()) newErrors.specialty = 'Especialidade é obrigatória'
    if (formData.petitions.length !== 3) {
      alert('É necessário fazer upload das 3 petições autorais')
      return false
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Upload seguro via Supabase autenticado (bearer da ponte)
  const uploadPetitionFile = async (
    supabase: Awaited<ReturnType<typeof getClient>>['supabase'],
    uid: string,
    file: File,
    fileName: string,
  ): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const safeName = fileName.replace(/\s+/g, '_').replace(/[^\w\-\.]/g, '')
    // organiza por UID do Firebase
    const filePath = `petitions/${uid}/${Date.now()}_${safeName}.${ext}`

    const { error: upErr } = await supabase.storage.from('petition_files').upload(filePath, file)
    if (upErr) {
      console.error('Erro no upload:', upErr)
      return null
    }

    // Se o bucket estiver público, ok; se privado, você pode usar createSignedUrl.
    const { data: urlData, error: urlErr } = supabase.storage.from('petition_files').getPublicUrl(filePath)
    if (urlErr) {
      console.error('Erro ao obter URL pública:', urlErr)
      return null
    }
    return urlData.publicUrl
  }

  const submitRedactorApplication = async (): Promise<boolean> => {
    // 1) cria conta no Firebase com role 'writer' e grava perfil base no Supabase
    const cleanEmail = formData.email.trim().toLowerCase()

    await registerUser({
      email: cleanEmail,
      password: formData.password,
      role: 'writer',
      profileData: {
        name: formData.name,
        phone: formData.phone,
        oab: formData.oab,
        specialty: formData.specialty,
      },
    })

    // 2) pega Supabase autenticado e UID
    const { supabase, uid } = await getClient()

    // 3) faz os uploads (em pasta do UID)
    const [url1, url2, url3] = await Promise.all([
      uploadPetitionFile(supabase, uid, formData.petitions[0], `peticao_1_${formData.name}`),
      uploadPetitionFile(supabase, uid, formData.petitions[1], `peticao_2_${formData.name}`),
      uploadPetitionFile(supabase, uid, formData.petitions[2], `peticao_3_${formData.name}`),
    ])

    if (!url1 || !url2 || !url3) throw new Error('Erro ao fazer upload das petições')

    // 4) chama Edge Function autenticada
    const { data, error } = await supabase.functions.invoke(
      'app_2d8133c678_submit_redator_application',
      {
        body: {
          uid,                           // quem submeteu
          nome: formData.name,
          email: cleanEmail,
          telefone: formData.phone,
          oab: formData.oab,
          especialidade: formData.specialty,
          peticao_1_url: url1,
          peticao_2_url: url2,
          peticao_3_url: url3,
        },
      }
    )

    if (error) {
      console.error('Function error:', error)
      return false
    }

    // opcional: validar `data`
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const ok = await submitRedactorApplication()
      if (ok) setSubmitted(true)
      else alert('Erro ao enviar solicitação. Tente novamente.')
    } catch (err: any) {
      console.error('Erro ao processar cadastro de redator:', err)
      alert(err?.message || 'Erro ao processar cadastro. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Cadastro Enviado!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sua solicitação de cadastro foi enviada para análise junto com suas petições autorais.
            </p>
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                <div className="text-left">
                  <h3 className="text-sm font-medium text-yellow-800">Próximos Passos</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Suas petições estão sendo analisadas pela equipe</li>
                      <li>Você receberá um email de confirmação quando aprovado</li>
                      <li>O processo pode levar até 48 horas úteis</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <a href="/auth/login" className="text-orange-600 hover:text-orange-500 font-medium">
                Voltar para o login
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <img className="h-12 w-auto" src="/logo-veredicta.png" alt="Veredicta Jus" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Cadastro de Redator
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Preencha os dados e envie suas petições autorais para aprovação
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Dados Pessoais</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nome Completo *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Telefone *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="oab" className="block text-sm font-medium text-gray-700">
                  Número da OAB *
                </label>
                <input
                  id="oab"
                  name="oab"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  value={formData.oab}
                  onChange={(e) => setFormData({ ...formData, oab: e.target.value })}
                />
                {errors.oab && <p className="mt-1 text-sm text-red-600">{errors.oab}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                Especialidade Jurídica *
              </label>

              <select
                id="specialty"
                name="specialty"
                required
                autoComplete="off"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              >
                <option value="" disabled>Selecione sua especialidade</option>
                {LAW_AREAS.map(area => (
                  <option key={area.value} value={area.value}>{area.label}</option>
                ))}
                <option value="outros">Outros</option>
              </select>

              {errors.specialty && (<p className="mt-1 text-sm text-red-600">{errors.specialty}</p>)}
            </div>
          </div>

          {/* Senha de Acesso */}
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Senha de Acesso</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Senha *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha *
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Upload das Petições */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <PetitionUpload
              petitions={formData.petitions}
              onPetitionsChange={(petitions) => setFormData({ ...formData, petitions })}
            />
          </div>

          {/* Enviar */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <button
              type="submit"
              disabled={isSubmitting || formData.petitions.length !== 3}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando solicitação...
                </>
              ) : (
                'Enviar Solicitação de Cadastro'
              )}
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center">
              Ao enviar esta solicitação, suas petições autorais serão analisadas pela equipe do Veredicta Jus.
              Você receberá um email de confirmação quando seu cadastro for aprovado.
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}