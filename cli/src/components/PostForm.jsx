import React, { useState } from "react";
import axios from "axios";

const PostForm = () => {
  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState(null); // FileList or File[]
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.append("content", content);
    formData.append("userId", "1"); // Replace with actual user ID

    // Append each selected file
    if (selectedFiles) {
      Array.from(selectedFiles).forEach((file) => {
        formData.append("images", file);
      });
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // ← Critical!
            Authorization: `Bearer ${token}`, // ← Fixed auth placement
          },
        },
      );
      console.log("Post created:", res.data);
      setMessage("Post created successfully!");
      setContent("");
      setSelectedFiles(null);
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded border p-4 shadow">
      <h2 className="mb-4 text-xl font-bold">Upload Images</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="rounded border p-2"
          rows={4}
          required
        />
        <input
          type="file"
          // DO NOT use `value` here — it's uncontrolled
          multiple // optional: allow multiple files
          accept="image/*" // optional: restrict to images
          onChange={(e) => setSelectedFiles(e.target.files)} // Store FileList
          className="rounded border p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-500 py-2 text-white hover:bg-blue-600"
        >
          {loading ? "Uploading..." : "Upload Images"}
        </button>
      </form>
      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
};

export default PostForm;
