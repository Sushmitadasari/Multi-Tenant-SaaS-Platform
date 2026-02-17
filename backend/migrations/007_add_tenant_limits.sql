-- Up Migration
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'max_users') THEN
        ALTER TABLE tenants ADD COLUMN max_users INTEGER DEFAULT 5;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tenants' AND column_name = 'max_projects') THEN
        ALTER TABLE tenants ADD COLUMN max_projects INTEGER DEFAULT 3;
    END IF;
END $$;
