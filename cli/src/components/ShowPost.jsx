import React, { useState, useEffect } from "react";
import axios from "axios";

const ShowPost = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setError("User ID is required");
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/users/${userId}/posts`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          },
        );

        // Your API returns { posts: [...] }, so extract it
        setPosts(res.data.posts || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(err.response?.data?.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [userId]);

  if (loading) return <p className="text-center">Loading posts...</p>;
  if (error) return <p className="text-center text-red-500">Error: {error}</p>;
  if (!posts.length) return <p className="text-center">No posts yet.</p>;

  return (
    <div className="space-y-6 pt-10">
      <h2 className="text-center text-2xl font-bold">User Upload</h2>
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded border p-4 shadow transition hover:shadow-md"
        >
          <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

          {/* Render all images */}
          <div className="flex flex-wrap gap-2">
            {post.images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`post-${index}`}
                className="h-32 w-32 rounded object-cover"
              />
            ))}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            {new Date(post.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShowPost;
