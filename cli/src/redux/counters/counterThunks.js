import { createAsyncThunk } from "@reduxjs/toolkit";
import { fetchCounterAPI, updateCounterAPI } from "./counterAPI";

export const fetchCounter = createAsyncThunk(
  "counter/fetchCounter",
  async () => {
    const value = await fetchCounterAPI();
    return value;
  },
);

export const updateCounter = createAsyncThunk(
  "counter/updateCounter",
  async (amount) => {
    const updated = await updateCounterAPI(amount);
    return updated;
  },
);
