"use client";

import { useEffect, useState } from "react";

export default function Contador() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function getPosts() {
      const res = await fetch("/api/posts");
      const data = await res.json();
      return setPosts(data);
    }
    getPosts();
  }, []);

  return (
    <div>
        {posts.map((post: { id: number; title: string }) => (
          <div key={post.id}>{post.title}</div>
        ))}
    </div>
  );
}
