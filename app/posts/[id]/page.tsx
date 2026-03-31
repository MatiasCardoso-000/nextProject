import { getPost } from "@/app/lib/posts";
import { LikeButton } from "./LikeButton";

export const generateMetadata = async ({
  params,
}: {
  params: { id: string };
}) => {
  const { id } = await params;
  const post = await getPost(id);

  return {
    title: post.title,
    description: post.body,
  };
};

export default async function PostPage({ params }: { params: { id: string } }) {
  const { id } = await params;

  const post = await getPost(id);

  return (
    <>
      <div>
        <h1 style={{ fontWeight: "bold" }}>{post.title}</h1>
        <p>{post.body}</p>
      </div>
      <LikeButton />
    </>
  );
}
