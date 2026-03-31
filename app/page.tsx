import Link from 'next/link'

export const metadata = {
  title: 'TIL — Today I Learned',
  description: 'Una cosa aprendida por día.',
}

export default async function Home() {
  const res = await fetch('http://localhost:3001/api/posts', {
    cache: "no-store"
  })
  const posts = await res.json()
  
  return (
    <main>
      <h1>Posts</h1>
      {posts.map((post: { id: number; title: string }) => (
        <div key={post.id}>
          <Link href={`http://localhost:3001/api/posts/${post.id}`}>
            <h2>{post.title}</h2>
          </Link>
        </div>
      ))}
    </main>
  )
}