-- Conceder permissões PUBLIC para a tabela parceiros
-- Este script permitirá que usuários anônimos possam visualizar os dados da tabela parceiros

-- Corrigir permissões de acesso anônimo para a tabela parceiros
ALTER TABLE public.parceiros ENABLE ROW LEVEL SECURITY;

-- Política para permitir SELECT para qualquer pessoa (incluindo anônimos)
DROP POLICY IF EXISTS "Permitir SELECT para anônimos" ON public.parceiros;
CREATE POLICY "Permitir SELECT para anônimos" 
ON public.parceiros
FOR SELECT 
TO anon
USING (true);

-- Política para permitir SELECT para usuários autenticados
DROP POLICY IF EXISTS "Permitir SELECT para usuários autenticados" ON public.parceiros;
CREATE POLICY "Permitir SELECT para usuários autenticados" 
ON public.parceiros
FOR SELECT 
TO authenticated
USING (true);

-- Conceder permissões de SELECT para anônimos e usuários autenticados
GRANT SELECT ON public.parceiros TO anon;
GRANT SELECT ON public.parceiros TO authenticated;

-- Opcional: Permitir acesso também às tabelas relacionadas, se existirem
-- GRANT SELECT ON public.tabela_relacionada TO anon;
-- GRANT SELECT ON public.tabela_relacionada TO authenticated;

-- Confirmar que as alterações foram aplicadas com sucesso
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'parceiros'; 