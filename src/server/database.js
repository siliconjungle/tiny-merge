import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from './config'

const supabase = createClient(supabaseUrl, supabaseKey)

export const getSnapshot = async (slug) => {
  const { data, error } = await supabase
  .from('rooms')
  .select('snapshot')
  .is('slug', slug)

  if (error) {
    // Probably doesn't exist.
    // Could be another error. We should check for other errors too.
    return []
  }

  return JSON.parse(data[0].snapshot)
}

export const setSnapshot = async (slug, snapshot) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert({ snapshot: JSON.stringify(snapshot), slug })
    .single()

  if (error) {
    return []
  }

  return data
}

export default supabase
