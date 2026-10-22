CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  full_name VARCHAR(200) NOT NULL,

  email VARCHAR(200) NOT NULL UNIQUE,

  password_hash VARCHAR(200) NOT NULL,

  role VARCHAR(20) NOT NULL DEFAULT 'customer'
  CHECK (role IN ('customer', 'admin')),

  status VARCHAR(20) NOT NULL DEFAULT 'active' 
  CHECK (status IN ('active', 'suspended')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);