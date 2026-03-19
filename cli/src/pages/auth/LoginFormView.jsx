import React, { useState } from "react";
import axios from "axios";

const LoginFormView = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        { ...formData },
      );

      localStorage.setItem("token", response.data.token);

      setSuccess("Login successful!");
      console.log("Response:", response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto my-10 max-w-md rounded-xl border p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-semibold">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {success && (
          <p className="mt-2 text-center text-green-600">{success}</p>
        )}
        {error && <p className="mt-2 text-center text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default LoginFormView;
