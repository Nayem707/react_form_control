import { createSlice } from "@reduxjs/toolkit";
import initialState from "./reducers/initialState";
import reducers from "./reducers/reducers";
import buildersReducers from "./reducers/extraReducer";

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers,
  extraReducers: buildersReducers,
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export default counterSlice.reducer;
