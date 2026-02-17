-- Up Migration
DO $$
BEGIN
    -- Add password_hash
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password_hash') THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;

    -- Add full_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'full_name') THEN
        ALTER TABLE users ADD COLUMN full_name VARCHAR(255);
    END IF;

    -- Add role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role') THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50);
        -- Add check constraint for role if not exists (harder to check constraint existence easily in DO block without complex query, 
        -- but we can try adding it and catching error, or just skipping constraint check for now to be safe and simple. 
        -- Let's just add the check constraint. If it fails due to existing violations, it will fail.
        -- Safest is to just add the column. The app code usually enforces enum-like behavior too.
        -- START TRANSACITON;
        -- ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'tenant_admin', 'user'));
        -- COMMIT;
    END IF;

    -- Add is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
        ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;

    -- Add updated_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;
