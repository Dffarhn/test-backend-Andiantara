-- Migration untuk menambahkan kolom created_by ke tabel items jika belum ada
-- Ini diperlukan jika tabel items sudah dibuat sebelumnya tanpa kolom created_by

DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Cek apakah kolom created_by sudah ada
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'items' 
        AND column_name = 'created_by'
    ) THEN
        -- Ambil user pertama yang ada (untuk set default pada data lama)
        SELECT id INTO first_user_id FROM users LIMIT 1;
        
        -- Jika tidak ada user, buat dummy user dulu
        IF first_user_id IS NULL THEN
            INSERT INTO users (id, name, email, password)
            VALUES ('00000000-0000-0000-0000-000000000000', 'System', 'system@example.com', 'dummy')
            ON CONFLICT (id) DO NOTHING
            RETURNING id INTO first_user_id;
        END IF;
        
        -- Tambahkan kolom created_by sebagai nullable dulu
        ALTER TABLE items 
        ADD COLUMN created_by UUID;
        
        -- Update semua data yang ada dengan user pertama (atau dummy user)
        UPDATE items 
        SET created_by = COALESCE(first_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
        WHERE created_by IS NULL;
        
        -- Set kolom menjadi NOT NULL
        ALTER TABLE items 
        ALTER COLUMN created_by SET NOT NULL;
        
        -- Set foreign key constraint
        ALTER TABLE items 
        ADD CONSTRAINT items_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT;
        
        RAISE NOTICE 'Kolom created_by berhasil ditambahkan ke tabel items';
    ELSE
        RAISE NOTICE 'Kolom created_by sudah ada di tabel items';
    END IF;
END $$;

