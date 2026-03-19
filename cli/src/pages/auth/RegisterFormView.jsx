"use client";

import React, { useState } from "react";
import axios from "axios";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, type, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formDataToSend = new FormData();

    formDataToSend.append("name", formData.name);
    formDataToSend.append("username", formData.username);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);

    if (formData.profileImage) {
      formDataToSend.append("profileImage", formData.profileImage);
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        formDataToSend,
      );
      setSuccess("Registration successful!");
      console.log("Response:", response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 max-w-md rounded-xl border p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Register</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="rounded-md border px-3 py-2 focus:ring focus:outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="rounded-md border px-3 py-2 focus:ring focus:outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="rounded-md border px-3 py-2 focus:ring focus:outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="rounded-md border px-3 py-2 focus:ring focus:outline-none"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium">Profile Image URL</label>
          <input
            type="file"
            name="profileImage"
            onChange={handleChange}
            className="rounded-md border px-3 py-2 focus:ring focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Registering..." : "Register"}
        </button>

        {success && (
          <p className="mt-2 text-center text-green-600">{success}</p>
        )}
        {error && <p className="mt-2 text-center text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default RegisterForm;
