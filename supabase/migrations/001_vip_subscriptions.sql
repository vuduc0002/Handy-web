-- Add subscription columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip_until TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT NULL;

-- Comment on columns
COMMENT ON COLUMN public.profiles.vip_until IS 'NULL means lifetime VIP, otherwise expiry datetime';
COMMENT ON COLUMN public.profiles.plan_type IS '3m | 6m | 1y | lifetime';
