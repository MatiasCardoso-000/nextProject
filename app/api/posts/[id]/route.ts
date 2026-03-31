import { NextResponse } from "next/server";

const posts = [
  { id: "1", title: "post 1", body: "post 1 description", likes: 4 },
  { id: "2", title: "post 2", body: "post 2 description", likes: 22 },
  { id: "3", title: "post 3", body: "post 3 description", likes: 11 },
  { id: "4", title: "post 4", body: "post 4 description", likes: 42 },
];

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const { id } = await params;

  const post = posts.find((p) => p.id == id);

  if (!post) {
  return  NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(post);
}
