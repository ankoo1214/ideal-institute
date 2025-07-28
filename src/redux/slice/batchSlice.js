import { createSlice } from '@reduxjs/toolkit';

const batchSlice = createSlice({
  name: 'batches',
  initialState: [],
  reducers: {
    setBatches: (state, action) => action.payload,
    addBatch: (state, action) => {
      state.push(action.payload);
    },
    updateBatch: (state, action) => {
      const idx = state.findIndex(b => b.id === action.payload.id);
      if (idx !== -1) state[idx] = { ...state[idx], ...action.payload.changes };
    },
  },
});

export const { setBatches, addBatch, updateBatch } = batchSlice.actions;
export default batchSlice.reducer;
