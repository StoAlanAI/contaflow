# ContaFlow

Plataforma de gestión financiera para contadores y sus clientes.

## Stack

- **Next.js 14** (App Router)
- **Supabase** (Auth + PostgreSQL)
- **Tailwind CSS**
- **Recharts**

## Configuración

### 1. Clonar e instalar

```bash
git clone <repo>
cd contaflow
npm install
```

### 2. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completar con los datos de tu proyecto en [supabase.com](https://supabase.com):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

### 3. Base de datos

En el **SQL Editor** de Supabase, ejecutar el archivo completo:

```
supabase/schema.sql
```

### 4. Desarrollo local

```bash
npm run dev
```

## Deploy en VPS

### Requisitos
- Node.js 18+
- PM2 (recomendado para proceso persistente)

```bash
# Build
npm run build

# Iniciar con PM2
pm2 start npm --name contaflow -- start
pm2 save
pm2 startup
```

### Con Nginx (proxy inverso)

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Flujo de uso

1. El **contador** se registra en `/registro`
2. Desde su panel `/dashboard`, genera un **link único** para cada cliente
3. El **cliente** abre el link, completa su nombre y email
4. Se le muestra su contraseña generada automáticamente
5. El cliente accede a `/mi-cuenta` para registrar ingresos y egresos
6. El contador puede ver las finanzas de cada cliente en `/admin/clientes/[id]`

## Divisas soportadas

- **ARS** — Pesos argentinos
- **USD** — Dólares estadounidenses
- **EUR** — Euros
