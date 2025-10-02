import { supabaseAdmin } from './server-client'

/**
 * Supabase Storage Operations
 */

const BUCKET_NAME = 'assets'

/**
 * Upload a file to storage
 */
export async function uploadFile(
  path: string,
  file: File | Blob,
  contentType?: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      contentType: contentType || 'application/octet-stream',
      upsert: false,
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return publicUrl
}

/**
 * Upload image from URL
 */
export async function uploadImageFromUrl(
  url: string,
  path: string
): Promise<string> {
  // Fetch image
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to fetch image')

  const blob = await response.blob()
  return uploadFile(path, blob, response.headers.get('content-type') || 'image/png')
}

/**
 * Get signed URL for private file
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn)

  if (error) throw error
  return data.signedUrl
}

/**
 * Delete file from storage
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) throw error
}

/**
 * List files in a directory
 */
export async function listFiles(path: string = '') {
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .list(path)

  if (error) throw error
  return data
}

/**
 * Generate unique file path
 */
export function generateFilePath(
  prefix: string,
  scriptId: string,
  extension: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}/${scriptId}/${timestamp}-${random}.${extension}`
}
