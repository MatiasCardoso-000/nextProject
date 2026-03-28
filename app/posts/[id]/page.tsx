export async function generateMetadata({ params }: { params: { id: string } }) {
  const { id } = await params
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`)
  const post = await res.json()

  return {
    title: post.title,
    description: post.body,
  }
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    next: { revalidate: 60 },
  });

  const post = await res.json();
  
  return (
    <div>
      <h1>
        Post #{id} {post.title}
      </h1>
      <p>{post.body}</p>
    </div>
  );
}
