"use client";

import { useState } from "react";

export const LikeButton = () => {
  const [likes, setLikes] = useState(0);

  return (
    <div>
      <button onClick={() => setLikes(likes + 1)}>Like Post ❤</button>{" "}
      <span>{likes}</span>
    </div>
  );
};
