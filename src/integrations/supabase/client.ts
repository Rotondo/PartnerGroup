// src/integrations/supabase/client.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

// Variáveis de ambiente para conexão com o Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Criação do cliente Supabase com tipagem forte
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Funções auxiliares para verificar o estado da conexão
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('empresas_grupo').select('*').limit(1);
    if (error) throw error;
    return { success: true, message: "Conexão com Supabase estabelecida com sucesso" };
  } catch (error) {
    console.error("Erro ao conectar com Supabase:", error);
    return { success: false, message: "Falha ao conectar com Supabase", error };
  }
};
