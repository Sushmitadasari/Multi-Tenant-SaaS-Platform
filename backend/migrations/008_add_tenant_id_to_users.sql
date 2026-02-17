-- Up Migration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'tenant_id') THEN
        ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        -- We might want to add the unique constraint too if it's missing, but let's start with the column.
        -- ALTER TABLE users ADD CONSTRAINT users_tenant_id_email_key UNIQUE (tenant_id, email);
    END IF;
END $$;
