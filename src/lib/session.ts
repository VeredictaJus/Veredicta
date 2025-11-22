// src/lib/session.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from './firebase'
import { supabase } from './supabaseClient' // Usar o cliente principal

// Usar o cliente principal exportado de supabaseClient.ts

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