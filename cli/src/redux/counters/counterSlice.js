import { createSlice } from "@reduxjs/toolkit";
import { fetchCounter, updateCounter } from "./counterThunks";

const initialState = {
  value: 0,
  loading: false,
  error: null,
};

const reducers = {
  increment: (state) => {
    state.value += 1;
  },
  decrement: (state) => {
    state.value -= 1;
  },
  incrementByAmount: (state, action) => {
    state.value += action.payload;
  },
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers,
  extraReducers: (builder) => {
    builder
      // fetchCounter
      .addCase(fetchCounter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCounter.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(fetchCounter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // updateCounter
      .addCase(updateCounter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCounter.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(updateCounter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
