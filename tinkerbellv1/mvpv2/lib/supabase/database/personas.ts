import { supabaseAdmin } from '../server-client'
import type { Persona, PersonaData } from '@/types/database'

/**
 * Persona Database Operations
 */

export async function createPersona(data: {
  company_id: string
  name: string
  persona_json: PersonaData
}): Promise<Persona> {
  const { data: persona, error } = await supabaseAdmin
    .from('personas')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return persona
}

export async function createPersonas(personas: Array<{
  company_id: string
  name: string
  persona_json: PersonaData
}>): Promise<Persona[]> {
  const { data, error } = await supabaseAdmin
    .from('personas')
    .insert(personas)
    .select()

  if (error) throw error
  return data
}

export async function getPersona(id: string): Promise<Persona | null> {
  const { data, error } = await supabaseAdmin
    .from('personas')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getPersonasByCompany(companyId: string): Promise<Persona[]> {
  const { data, error } = await supabaseAdmin
    .from('personas')
    .select()
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updatePersona(
  id: string,
  updates: Partial<Omit<Persona, 'id' | 'created_at'>>
): Promise<Persona> {
  const { data, error } = await supabaseAdmin
    .from('personas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePersona(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('personas')
    .delete()
    .eq('id', id)

  if (error) throw error
}
