-- ============================================
-- ContaFlow - Schema SQL para Supabase
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
-- TABLA: profiles
-- Extiende auth.users de Supabase
-- ─────────────────────────────────────────────
CREATE TABLE public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  nombre      TEXT NOT NULL DEFAULT '',
  rol         TEXT NOT NULL CHECK (rol IN ('contador', 'cliente')),
  contador_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger: crear profile automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, rol)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- TABLA: invitaciones
-- Tokens únicos para incorporar nuevos clientes
-- ─────────────────────────────────────────────
CREATE TABLE public.invitaciones (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token       TEXT UNIQUE NOT NULL,
  contador_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  usado       BOOLEAN NOT NULL DEFAULT FALSE,
  cliente_id  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- TABLA: transacciones
-- Ingresos y egresos de cada cliente
-- ─────────────────────────────────────────────
CREATE TABLE public.transacciones (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo       TEXT NOT NULL CHECK (tipo IN ('ingreso', 'egreso')),
  monto      NUMERIC(15, 2) NOT NULL CHECK (monto > 0),
  divisa     TEXT NOT NULL CHECK (divisa IN ('ARS', 'USD', 'EUR')),
  motivo     TEXT NOT NULL DEFAULT '',
  fecha      DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transacciones ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Usuario ve su propio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Contador ve perfiles de sus clientes"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.rol = 'contador'
    )
    AND contador_id = auth.uid()
  );

CREATE POLICY "Usuario actualiza su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- INVITACIONES
CREATE POLICY "Contador gestiona sus invitaciones"
  ON public.invitaciones FOR ALL
  USING (contador_id = auth.uid());

CREATE POLICY "Token público (para validar en onboarding)"
  ON public.invitaciones FOR SELECT
  USING (true);

-- TRANSACCIONES
CREATE POLICY "Cliente gestiona sus propias transacciones"
  ON public.transacciones FOR ALL
  USING (cliente_id = auth.uid());

CREATE POLICY "Contador ve transacciones de sus clientes"
  ON public.transacciones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles c
      WHERE c.id = transacciones.cliente_id
        AND c.contador_id = auth.uid()
    )
  );

CREATE POLICY "Contador crea transacciones para sus clientes"
  ON public.transacciones FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles c
      WHERE c.id = cliente_id
        AND c.contador_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- ÍNDICES
-- ─────────────────────────────────────────────
CREATE INDEX idx_profiles_contador_id     ON public.profiles(contador_id);
CREATE INDEX idx_invitaciones_token       ON public.invitaciones(token);
CREATE INDEX idx_invitaciones_contador_id ON public.invitaciones(contador_id);
CREATE INDEX idx_transacciones_cliente_id ON public.transacciones(cliente_id);
CREATE INDEX idx_transacciones_fecha      ON public.transacciones(fecha DESC);
