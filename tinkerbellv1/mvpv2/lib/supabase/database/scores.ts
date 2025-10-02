import { supabaseAdmin } from '../server-client'
import type { Score } from '@/types/database'

/**
 * Score Database Operations
 */

export async function createScore(data: {
  script_id: string
  trend_score: number
  llm_score: number
  viral_score: number
  final_score: number
  rationale: string
}): Promise<Score> {
  const { data: score, error } = await supabaseAdmin
    .from('scores')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return score
}

export async function getScore(id: string): Promise<Score | null> {
  const { data, error } = await supabaseAdmin
    .from('scores')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getScoreByScript(scriptId: string): Promise<Score | null> {
  const { data, error } = await supabaseAdmin
    .from('scores')
    .select()
    .eq('script_id', scriptId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getScoresByScripts(scriptIds: string[]): Promise<Score[]> {
  const { data, error } = await supabaseAdmin
    .from('scores')
    .select()
    .in('script_id', scriptIds)
    .order('final_score', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getTopScoredScripts(
  personaId: string,
  limit: number = 10
): Promise<Array<Score & { script: any }>> {
  const { data, error } = await supabaseAdmin
    .from('scores')
    .select(`
      *,
      script:scripts!inner(*)
    `)
    .eq('script.persona_id', personaId)
    .order('final_score', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as any || []
}

export async function updateScore(
  id: string,
  updates: Partial<Omit<Score, 'id' | 'created_at'>>
): Promise<Score> {
  const { data, error } = await supabaseAdmin
    .from('scores')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteScore(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('scores')
    .delete()
    .eq('id', id)

  if (error) throw error
}
