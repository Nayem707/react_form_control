import React, { useState, useEffect } from "react";
import axios from "axios";

const NewsFeedView = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/posts", {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        // API returns { posts: [...] }
        setPosts(res.data.posts || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
        setError(err.response?.data?.message || "Failed to load news feed");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="py-10 text-center">
        <p>Loading feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  const BASE_URL = "http://localhost:5000";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="mb-6 text-center text-2xl font-bold">News Feed</h1>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">No posts available.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className="rounded-lg border p-4 shadow-sm transition hover:shadow-md"
          >
            {/* Post Header: User Info */}
            <div className="mb-3 flex items-center gap-3">
              {post.user.profileImage ? (
                <img
                  src={`${BASE_URL}/${post.user.profileImage}`}
                  alt={post.user.fullName}
                  className="h-10 w-10 rounded-full border object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                  <span className="font-medium text-gray-600">
                    {post.user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-semibold">{post.user.fullName}</h3>
                <p className="text-sm text-gray-500">@{post.user.username}</p>
              </div>
            </div>

            {/* Post Content */}
            <p className="mb-3 whitespace-pre-wrap">{post.content}</p>

            {/* Post Images */}
            {post.images && post.images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {post.images.map((imgPath, idx) => (
                  <img
                    key={idx}
                    src={`${BASE_URL}/${imgPath}`}
                    alt={`Post image ${idx + 1}`}
                    className="h-24 w-24 rounded border object-cover md:h-32 md:w-32"
                    onError={(e) => {
                      e.target.classList.add("hidden");
                    }}
                  />
                ))}
              </div>
            )}

            {/* Post Meta: Likes & Date */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                {post.likeCount} {post.likeCount === 1 ? "like" : "likes"}
              </span>
              <span>{new Date(post.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NewsFeedView;
