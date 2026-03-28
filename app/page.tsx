export const metadata = {
  title: 'TIL — Today I Learned',
  description: 'Una cosa aprendida por día.',
}

export default async function Home() {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5',{
    cache:"no-store"
  })
  const posts = await res.json()

  return (
    <main>
      <h1>Posts</h1>
      {posts.map((post: { id: number; title: string }) => (
        <div key={post.id}>
          <h2>{post.title}</h2>
        </div>
      ))}
    </main>
  )
}