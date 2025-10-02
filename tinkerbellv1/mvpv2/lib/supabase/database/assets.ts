import { supabaseAdmin } from '../server-client'
import type { Asset, ImageBrief, VideoBrief } from '@/types/database'

/**
 * Asset Database Operations
 */

export async function createAsset(data: {
  script_id: string
  image_brief?: ImageBrief
  video_brief?: VideoBrief
  image_urls?: string[]
  video_urls?: string[]
}): Promise<Asset> {
  const { data: asset, error } = await supabaseAdmin
    .from('assets')
    .insert([data])
    .select()
    .single()

  if (error) throw error
  return asset
}

export async function getAsset(id: string): Promise<Asset | null> {
  const { data, error } = await supabaseAdmin
    .from('assets')
    .select()
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getAssetByScript(scriptId: string): Promise<Asset | null> {
  const { data, error } = await supabaseAdmin
    .from('assets')
    .select()
    .eq('script_id', scriptId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data
}

export async function getAssetsByScripts(scriptIds: string[]): Promise<Asset[]> {
  const { data, error } = await supabaseAdmin
    .from('assets')
    .select()
    .in('script_id', scriptIds)

  if (error) throw error
  return data || []
}

export async function updateAsset(
  id: string,
  updates: Partial<Omit<Asset, 'id' | 'created_at'>>
): Promise<Asset> {
  const { data, error } = await supabaseAdmin
    .from('assets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function addImageUrls(
  scriptId: string,
  imageUrls: string[]
): Promise<Asset> {
  // Get existing asset
  const existing = await getAssetByScript(scriptId)
  
  if (existing) {
    // Update existing
    const allUrls = [...(existing.image_urls || []), ...imageUrls]
    return updateAsset(existing.id, { image_urls: allUrls })
  } else {
    // Create new
    return createAsset({ script_id: scriptId, image_urls: imageUrls })
  }
}

export async function addVideoUrls(
  scriptId: string,
  videoUrls: string[]
): Promise<Asset> {
  // Get existing asset
  const existing = await getAssetByScript(scriptId)
  
  if (existing) {
    // Update existing
    const allUrls = [...(existing.video_urls || []), ...videoUrls]
    return updateAsset(existing.id, { video_urls: allUrls })
  } else {
    // Create new
    return createAsset({ script_id: scriptId, video_urls: videoUrls })
  }
}

export async function deleteAsset(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('assets')
    .delete()
    .eq('id', id)

  if (error) throw error
}
