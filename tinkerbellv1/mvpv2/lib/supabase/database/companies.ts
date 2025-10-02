import { supabaseAdmin } from '../server-client'
import type { Company, CompanyMetadata } from '@/types/database'

/**
 * Company Database Operations
 */

export async function createCompany(data: {
  user_id: string
  url: string
  uvp: string
  metadata?: CompanyMetadata
}): Promise<Company> {
  const { data: company, error } = await supabaseAdmin
    .from('companies')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return company
}

export async function getCompany(id: string): Promise<Company | null> {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getCompaniesByUser(userId: string): Promise<Company[]> {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .select()
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function updateCompany(
  id: string,
  updates: Partial<Omit<Company, 'id' | 'created_at'>>
): Promise<Company> {
  const { data, error } = await supabaseAdmin
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCompanyMetadata(
  id: string,
  metadata: CompanyMetadata
): Promise<Company> {
  return updateCompany(id, { metadata, scraped_at: new Date().toISOString() })
}

export async function deleteCompany(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) throw error
}
