import { supabaseAdmin } from '../server-client'
import type { Script, ScriptBatch, ScriptIdeaData, BatchStatus } from '@/types/database'

/**
 * Script and ScriptBatch Database Operations
 */

// Script Batch Operations
export async function createScriptBatch(data: {
  company_id: string
  persona_id: string
  seed_template: string
  temperature: number
  status?: BatchStatus
}): Promise<ScriptBatch> {
  const { data: batch, error } = await supabaseAdmin
    .from('script_batches')
    .insert([{ ...data, status: data.status || 'pending' }])
    .select()
    .single()

  if (error) throw error
  return batch
}

export async function getScriptBatch(id: string): Promise<ScriptBatch | null> {
  const { data, error } = await supabaseAdmin
    .from('script_batches')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function updateScriptBatchStatus(
  id: string,
  status: BatchStatus
): Promise<ScriptBatch> {
  const { data, error } = await supabaseAdmin
    .from('script_batches')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getScriptBatchesByPersona(personaId: string): Promise<ScriptBatch[]> {
  const { data, error } = await supabaseAdmin
    .from('script_batches')
    .select()
    .eq('persona_id', personaId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Script Operations
export async function createScript(data: {
  batch_id: string
  persona_id: string
  headline: string
  body: string
  cta: string
  keywords: string[]
  idea_json: ScriptIdeaData
}): Promise<Script> {
  const { data: script, error } = await supabaseAdmin
    .from('scripts')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return script
}

export async function createScripts(scripts: Array<{
  batch_id: string
  persona_id: string
  headline: string
  body: string
  cta: string
  keywords: string[]
  idea_json: ScriptIdeaData
}>): Promise<Script[]> {
  const { data, error } = await supabaseAdmin
    .from('scripts')
    .insert(scripts)
    .select()

  if (error) throw error
  return data
}

export async function getScript(id: string): Promise<Script | null> {
  const { data, error } = await supabaseAdmin
    .from('scripts')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getScriptsByBatch(batchId: string): Promise<Script[]> {
  const { data, error } = await supabaseAdmin
    .from('scripts')
    .select()
    .eq('batch_id', batchId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getScriptsByPersona(personaId: string): Promise<Script[]> {
  const { data, error } = await supabaseAdmin
    .from('scripts')
    .select()
    .eq('persona_id', personaId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateScript(
  id: string,
  updates: Partial<Omit<Script, 'id' | 'created_at'>>
): Promise<Script> {
  const { data, error } = await supabaseAdmin
    .from('scripts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteScript(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('scripts')
    .delete()
    .eq('id', id)

  if (error) throw error
}
