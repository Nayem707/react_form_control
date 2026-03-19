const buildersReducers = (builder) => {
  builder.addCase("reset", (state) => {
    state.value = 0;
  });
};
export default buildersReducers;
