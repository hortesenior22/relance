# Relance — Frontend

Plataforma web que conecta estudiantes, empresas y centros educativos para la gestión de prácticas y primer empleo.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** con paleta de marca personalizada
- **Supabase JS v2** para autenticación y base de datos
- **React Router v6** para el enrutamiento
- Fuentes: `Syne` (display) + `Plus Jakarta Sans` (body)

---

## Estructura de carpetas

```
src/
├── assets/
│   └── logo_relance.jpg
├── components/
│   ├── layout/
│   │   └── Header.jsx          ← Header sticky con nav + auth
│   ├── auth/
│   │   ├── LoginModal.jsx      ← Modal de inicio de sesión
│   │   ├── RegisterModal.jsx   ← Modal de registro con selector de rol
│   │   └── UserMenu.jsx        ← Dropdown del usuario logueado
│   └── home/
│       └── HeroSection.jsx     ← Hero de la landing page
├── pages/
│   ├── Home.jsx                ← Landing page
│   └── StudentProfile.jsx      ← Perfil del estudiante
├── context/
│   └── AuthContext.jsx         ← Contexto global de autenticación
├── lib/
│   └── supabase.js             ← Cliente de Supabase
├── index.css                   ← Estilos globales + utilidades Tailwind
└── main.jsx                    ← Punto de entrada
```

---

## Configuración inicial

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repo>
cd relance
npm install
```

### 2. Variables de entorno

Copia el archivo de ejemplo y rellena tus credenciales de Supabase:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Nunca subas `.env.local` al repositorio.** Está incluido en `.gitignore`.

### 3. Iniciar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## Configuración de Supabase

### Tabla `profiles`

Ejecuta este SQL en el editor de Supabase:

```sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  avatar_url text,
  bio text,
  center_name text,
  degree text,
  graduation_year text,
  skills text[] default '{}',
  search_type text,
  available_from date,
  modality text,
  city text,
  province text,
  is_public boolean default true,
  updated_at timestamptz default now()
);

-- RLS: cada usuario solo puede ver y editar su propio perfil
alter table profiles enable row level security;

create policy "Ver propio perfil" on profiles
  for select using (auth.uid() = id);

create policy "Editar propio perfil" on profiles
  for all using (auth.uid() = id);
```

### Storage para avatares

En Supabase > Storage, crea un bucket llamado `profiles` con acceso público.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Vista previa del build |

---

## Próximos pasos (no incluidos en este MVP)

- [ ] Páginas de empresa y centro educativo
- [ ] Sistema de candidaturas
- [ ] Mensajería interna
- [ ] Matching inteligente
- [ ] Panel de administración
