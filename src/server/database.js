import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseKey } from './config'

const supabase = createClient(supabaseUrl, supabaseKey)

export const getSnapshot = async (id) => {
  const { data, error } = await supabase
  .from('rooms')
  .select('snapshot')
  .is('slug', id)

  if (error) {
    // Probably doesn't exist.
    // Could be another error. We should check for other errors too.
    return []
  }

  return JSON.parse(data[0].snapshot)
}

export const setSnapshot = async (id, snapshot) => {
  const { data, error } = await supabase
    .from('rooms')
    .insert({ snapshot: JSON.stringify(snapshot), slug: id })
    .single()

  if (error) {
    return []
  }

  return data
}

export default supabase
