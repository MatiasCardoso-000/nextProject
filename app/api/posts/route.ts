import { NextResponse } from "next/server";
const posts = [
  {
    id: 1,
    title: "post 1",
  },
  {
    id: 2,
    title: "post 2",
  },
  {
    id: 3,
    title: "post 3",
  },
];

export async function GET() {
  return NextResponse.json(posts);
}
