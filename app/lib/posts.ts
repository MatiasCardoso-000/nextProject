import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";

export const getPost = cache(async (id: string) => {
  const res = await fetch(`/api/posts/${id}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    notFound()
  }

  return res.json();
});
