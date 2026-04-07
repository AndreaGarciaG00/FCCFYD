import supabase from '../supabase.js'

function bucketName() {
  const raw = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET
  const trimmed = typeof raw === 'string' ? raw.trim() : ''
  return trimmed || 'public-media'
}

function storageBucketError(bucket, err) {
  const msg = String(err?.message || err || '')
  if (/bucket not found/i.test(msg)) {
    return new Error(
      `El bucket de Storage "${bucket}" no existe en tu proyecto Supabase. ` +
        'En el panel: Storage → New bucket (id exacto: public-media) o ejecutá la migración supabase/migrations/20260331153000_storage_bucket_public_media.sql. ' +
        'Si ya tenés otro bucket, poné su id en VITE_SUPABASE_STORAGE_BUCKET en .env y reiniciá el servidor de Vite.'
    )
  }
  return err
}

function mimeFromFileName(name) {
  const n = String(name || '').toLowerCase()
  if (n.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  if (n.endsWith('.doc')) return 'application/msword'
  if (n.endsWith('.pdf')) return 'application/pdf'
  return undefined
}

/**
 * Corrige URLs guardadas sin el segmento `/public/` (p. ej. …/object/mi-bucket/… en lugar de …/object/public/mi-bucket/…),
 * que en Supabase suelen responder 400 al abrir el archivo.
 */
export function fixPublicStorageUrl(url) {
  if (!url || typeof url !== 'string') return url
  const bucket = bucketName()
  if (!bucket) return url
  const ok = `/storage/v1/object/public/${bucket}/`
  if (url.includes(ok)) return url
  const bad = `/storage/v1/object/${bucket}/`
  if (url.includes(bad)) {
    return url.replace(bad, ok)
  }
  return url
}

/**
 * Sube un archivo al bucket configurado (solo con sesión que tenga permiso en Storage RLS).
 * @param {{ path: string, file: File, upsert?: boolean }} opts
 * @returns {Promise<{ path: string, publicUrl: string }>}
 */
export async function uploadPublicFile({ path, file, upsert = true }) {
  const bucket = bucketName()
  const contentType = file.type || mimeFromFileName(file.name)
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert,
    contentType: contentType || undefined,
  })

  if (error) throw storageBucketError(bucket, error)

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return {
    path: data.path,
    publicUrl: fixPublicStorageUrl(urlData.publicUrl),
  }
}

/**
 * Elimina un objeto del bucket (falla silenciosamente si no existe).
 * @param {string} path
 */
export async function removePublicFile(path) {
  if (!path) return
  const bucket = bucketName()
  const { error } = await supabase.storage.from(bucket).remove([path])
  if (error) {
    const wrapped = storageBucketError(bucket, error)
    if (wrapped !== error) console.warn(wrapped.message)
    else if (!String(error.message || '').includes('not found')) {
      console.warn('storage remove:', error.message)
    }
  }
}

export function getStorageBucket() {
  return bucketName()
}
