// src/lib/session.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from './firebase'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://dmsodonmkffyvbuxtxec.supabase.co"
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc29kb25ta2ZmeXZidXh0eGVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDk1NDYsImV4cCI6MjA2OTAyNTU0Nn0.lI6m8L9IPkV_2YZonS94Z71VGoHj5lym9VN2L-t3sXg"

// Cria cliente Supabase direto
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function getSupabaseForCurrentUser(): Promise<{ supabase: SupabaseClient, uid: string }> {
  const user = getAuth().currentUser
  if (!user) throw new Error('Sem sessão Firebase')
  
  return { supabase, uid: user.uid }
}

export async function login(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  if (!user) throw new Error('Falha no login')
  return getSupabaseForCurrentUser()
}

export async function register(email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  if (!user) throw new Error('Falha no registro')
  return getSupabaseForCurrentUser()
}

export async function forgotPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}