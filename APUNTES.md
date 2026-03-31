# Next.js App Router — Apuntes

---

## 1. Server Components vs Client Components

### Teoría

En App Router, **todos los componentes son Server Components por defecto**.

| | Server Component | Client Component |
|---|---|---|
| ¿Dónde corre? | Servidor | Browser |
| ¿Puede usar hooks? | ❌ | ✅ |
| ¿Puede usar event handlers? | ❌ | ✅ |
| ¿Puede hacer fetch async directo? | ✅ | ❌ |
| ¿Qué llega al browser? | HTML ya con datos | HTML vacío → carga JS → muestra datos |

**¿Por qué importa?**
Con Server Components el HTML llega al browser ya con los datos cargados — mejor Time to First Contentful Paint. Con Client Components, el usuario ve pantalla en blanco mientras carga el JS y hace el fetch.

### Práctica

```tsx
// Server Component — async directo, sin useEffect
export default async function Page() {
  const res = await fetch('https://api.example.com/posts')
  const posts = await res.json()

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

```tsx
// Client Component — necesita "use client" para usar hooks o eventos
"use client"

import { useState, useEffect } from "react"

export default function Contador() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(setPosts)
  }, [])

  return (
    <ul>
      {posts.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

**Regla de oro:**
```
Server Component → datos, layouts, fetch, lógica sin interactividad
Client Component → useState, useEffect, onClick, formularios
```

---

## 2. Routing en App Router

### Teoría

La carpeta define la ruta. El archivo que representa la UI siempre se llama `page.tsx`.

```
app/
├── page.tsx              →  /
├── about/
│   └── page.tsx          →  /about
├── posts/
│   └── page.tsx          →  /posts
│   └── [id]/
│       └── page.tsx      →  /posts/1, /posts/42, /posts/999...
```

**Archivos especiales:**

| Archivo | Qué hace |
|---|---|
| `page.tsx` | UI de esa ruta |
| `layout.tsx` | Wrappea la página — persiste entre navegaciones |
| `loading.tsx` | UI de carga mientras el Server Component fetchea |

### Práctica

```tsx
// app/layout.tsx — wrappea TODA la app
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <nav>Mi navbar</nav>
        {children}
      </body>
    </html>
  )
}
```

```tsx
// app/posts/loading.tsx — se muestra automáticamente mientras carga
export default function Loading() {
  return <p>Cargando posts...</p>
}
```

```tsx
// app/posts/[id]/page.tsx — ruta dinámica
export default async function PostPage({ params }: { params: { id: string } }) {
  const { id } = await params
  // ...
}
```

---

## 3. SSG / SSR / ISR

### Teoría

Next.js tiene tres estrategias de rendering para Server Components. La diferencia está en **cuándo se ejecuta el fetch**.

| Estrategia | Cuándo se ejecuta el fetch | Cómo se configura |
|---|---|---|
| **SSG** — Static Site Generation | En build time, una sola vez | Default (sin opciones) |
| **SSR** — Server Side Rendering | En cada request | `cache: 'no-store'` |
| **ISR** — Incremental Static Regeneration | En build time + se regenera después de N segundos | `next: { revalidate: N }` |

**¿Cuándo usar cada uno en TIL?**

| Página | Estrategia | Por qué |
|---|---|---|
| Feed principal | SSR | Cambia en tiempo real |
| Perfil de usuario | ISR | Cambia, pero no en cada segundo |
| Post individual | ISR | Puede editarse, pero no frecuentemente |
| Landing / About | SSG | Nunca cambia |

**ISR — detalle importante:**
Después de N segundos el HTML cacheado *expira*. No se regenera automáticamente — el próximo usuario que entre *dispara* la regeneración. Hasta que eso pase, el HTML viejo sigue sirviendo.

### Práctica

```ts
// SSG — default, fetch en build time
const res = await fetch('https://api.com/posts')

// SSR — fetch en cada request
const res = await fetch('https://api.com/posts', {
  cache: 'no-store'
})

// ISR — fetch en build time, regenera cada 60 segundos
const res = await fetch('https://api.com/posts', {
  next: { revalidate: 60 }
})
```

---

## 4. Metadata API

### Teoría

Next.js inyecta el `<title>` y `<meta>` automáticamente — sin tocar el HTML directamente.

`export const metadata` se evalúa al mismo tiempo que la página estática: en build time para SSG/ISR o en request time si la ruta fuerza SSR. Es ideal para títulos/descripciones fijos en rutas como home, feed o about.

`generateMetadata` es async y corre por request en rutas dinámicas. Puede fetchear datos para componer el título/description según el `id` (ej: posts, perfiles).

¿Por qué estas APIs declarativas y no editar `<head>` a mano? Porque permiten composición entre layouts y segmentos, generan OG/Twitter tags consistentes, deduplican tags repetidos y mejoran la DX al centralizar metadata en cada route.

Dos formas:

| | Cuándo usarla |
|---|---|
| `export const metadata` | Páginas con título fijo — home, about, etc. |
| `export async function generateMetadata` | Rutas dinámicas — cuando el título depende del `id` u otro param |

### Práctica

```tsx
// Metadata estática — app/page.tsx
export const metadata = {
  title: 'TIL — Today I Learned',
  description: 'Una cosa aprendida por día.',
}

export default function Page() { ... }
```

```tsx
// Metadata dinámica — app/posts/[id]/page.tsx
export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params
  const res = await fetch(`https://api.com/posts/${id}`)
  const post = await res.json()

  return {
    title: post.title,
    description: post.body,
  }
}

export default async function PostPage({ params }) { ... }
```

### Deduplicar fetch entre generateMetadata y la página

Si `generateMetadata` y la page necesitan el mismo post, podés compartir un helper cacheado con `cache()` y marcarlo como `server-only`. Así evitás doble fetch dentro del mismo request.

```ts
// lib/posts.ts
import "server-only"
import { cache } from "react"

export const getPost = cache(async (id: string) => {
  const res = await fetch(`https://api.com/posts/${id}`)

  if (!res.ok) {
    throw new Error("Post not found")
  }

  return res.json()
})
```

```tsx
// app/posts/[id]/page.tsx
import { getPost } from "@/lib/posts"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params
  const post = await getPost(id)

  return {
    title: post.title,
    description: post.body,
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const post = await getPost(id)

  return <article>{post.title}</article>
}
```

---

## 5. Route Handlers (API Routes)

### Teoría

En App Router, las API routes se llaman **Route Handlers**. El archivo se llama `route.ts` y exporta funciones con el nombre del método HTTP.

```
app/
└── api/
    └── posts/
        └── route.ts   →  GET /api/posts
```

### Práctica

```ts
// app/api/posts/route.ts
import { NextResponse } from "next/server"

const posts = [
  { id: 1, title: "post 1" },
  { id: 2, title: "post 2" },
]

export async function GET() {
  return NextResponse.json(posts)
}
```

---

## Pendiente

- Conectar Next.js con backend Express de TIL
  - Backend está en el mismo repo que el frontend Vite (pendiente separar)
  - Strategy: separar backend → deployer en Railway/Render → conectar con URL del env
