import { createClient } from '@supabase/supabase-js'
import config from './config'

const supabaseUrl = config.supabaseUrl
const supabaseAnonKey = config.supabaseAnonKey

const options = {
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
}

// Logs para debug
console.log('Iniciando conexão com Supabase:', { 
  url: supabaseUrl,
  keyDefinida: !!supabaseAnonKey 
})

// Cria o cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, options) 