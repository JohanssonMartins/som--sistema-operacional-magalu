-- Script para corrigir vulnerabilidades de segurança do Supabase
-- Este script ativa o Row Level Security (RLS) e restringe o acesso público via API.
-- Como seu projeto usa Prisma (acesso direto ao banco), estas alterações não afetarão o funcionamento do app,
-- mas removerão os alertas de segurança do painel do Supabase.

-- 1. Ativar RLS para todas as tabelas
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ChecklistItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Evidencia" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BaseChecklistItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Autoauditoria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AutoauditoriaItem" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EvidenciaAutoauditoria" ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas restritivas por padrão
-- Estas políticas garantem que ninguém consiga ler os dados através da API pública do Supabase (PostgREST).
-- O Prisma continuará funcionando normalmente pois ele se conecta com o usuário 'postgres' que ignora o RLS.

DO $$
BEGIN
    -- Política para a tabela User (mais sensível)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'User' AND policyname = 'Restrict all public access') THEN
        CREATE POLICY "Restrict all public access" ON "User" FOR ALL USING (false);
    END IF;

    -- Outras tabelas
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ChecklistItem' AND policyname = 'Restrict all public access') THEN
        CREATE POLICY "Restrict all public access" ON "ChecklistItem" FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Evidencia' AND policyname = 'Restrict all public access') THEN
        CREATE POLICY "Restrict all public access" ON "Evidencia" FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'BaseChecklistItem' AND policyname = 'Restrict all public access') THEN
        CREATE POLICY "Restrict all public access" ON "BaseChecklistItem" FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Autoauditoria' AND policyname = 'Restrict all public access') THEN
        CREATE POLICY "Restrict all public access" ON "Autoauditoria" FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'AutoauditoriaItem' AND policyname = 'Restrict all public access') THEN
        CREATE POLICY "Restrict all public access" ON "AutoauditoriaItem" FOR ALL USING (false);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'EvidenciaAutoauditoria' AND policyname = 'Restrict all public access') THEN
        CREATE POLICY "Restrict all public access" ON "EvidenciaAutoauditoria" FOR ALL USING (false);
    END IF;
END
$$;

-- 3. Revogar explicitamente permissões de leitura da coluna 'password' para os papéis anon e authenticated
-- Isso adiciona uma camada extra de proteção caso alguém mude as políticas de RLS no futuro.
REVOKE SELECT (password) ON "User" FROM anon, authenticated;

-- 4. (Opcional) Se você quiser permitir que o usuário veja seus próprios dados via Supabase JS no futuro:
-- CREATE POLICY "Users can see their own profile" ON "User" FOR SELECT USING (auth.uid()::text = id);
