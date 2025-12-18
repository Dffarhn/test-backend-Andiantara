-- Migration untuk menambahkan kolom user_id ke tabel activity_logs jika belum ada
-- Ini diperlukan jika tabel activity_logs sudah dibuat sebelumnya tanpa kolom user_id

DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Cek apakah kolom user_id sudah ada
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'activity_logs' 
        AND column_name = 'user_id'
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
        
        -- Tambahkan kolom user_id sebagai nullable dulu
        ALTER TABLE activity_logs 
        ADD COLUMN user_id UUID;
        
        -- Update semua data yang ada dengan user pertama (atau dummy user)
        UPDATE activity_logs 
        SET user_id = COALESCE(first_user_id, '00000000-0000-0000-0000-000000000000'::uuid)
        WHERE user_id IS NULL;
        
        -- Set kolom menjadi NOT NULL
        ALTER TABLE activity_logs 
        ALTER COLUMN user_id SET NOT NULL;
        
        -- Set foreign key constraint
        ALTER TABLE activity_logs 
        ADD CONSTRAINT activity_logs_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT;
        
        RAISE NOTICE 'Kolom user_id berhasil ditambahkan ke tabel activity_logs';
    ELSE
        RAISE NOTICE 'Kolom user_id sudah ada di tabel activity_logs';
    END IF;
END $$;
