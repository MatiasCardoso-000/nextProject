

export default async function PostPage({ params }: { params: { id: string } }) {
  const {id}= await params
  return (
    <div>
      <h1>Post #{ id}</h1>
    </div>
  )
}