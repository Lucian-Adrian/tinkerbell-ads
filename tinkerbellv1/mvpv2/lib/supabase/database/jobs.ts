import { supabaseAdmin } from '../server-client'
import type { Job, JobType, JobStatus, JobPayload, JobResult } from '@/types/database'

/**
 * Job Database Operations
 */

export async function createJob(data: {
  type: JobType
  payload: JobPayload
  status?: JobStatus
}): Promise<Job> {
  const { data: job, error } = await supabaseAdmin
    .from('jobs')
    .insert([{ ...data, status: data.status || 'pending' }])
    .select()
    .single()

  if (error) throw error
  return job
}

export async function getJob(id: string): Promise<Job | null> {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  result?: JobResult,
  error?: string
): Promise<Job> {
  const updates: any = { status }
  
  if (result) updates.result = result
  if (error) updates.error = error
  if (status === 'completed' || status === 'failed') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error: updateError } = await supabaseAdmin
    .from('jobs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (updateError) throw updateError
  return data
}

export async function getJobsByType(
  type: JobType,
  limit: number = 50
): Promise<Job[]> {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select()
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getJobsByStatus(
  status: JobStatus,
  limit: number = 50
): Promise<Job[]> {
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .select()
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data || []
}

export async function getPendingJobs(limit: number = 10): Promise<Job[]> {
  return getJobsByStatus('pending', limit)
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function cleanupOldJobs(daysOld: number = 30): Promise<number> {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)

  const { error, count } = await supabaseAdmin
    .from('jobs')
    .delete()
    .lt('created_at', cutoffDate.toISOString())

  if (error) throw error
  return count || 0
}
