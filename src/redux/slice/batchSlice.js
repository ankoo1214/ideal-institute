import { createSlice } from '@reduxjs/toolkit';
import {
  addBatchAsync,
  fetchBatchesAsync,
  updateBatchAsync,
  deleteBatchAsync,
} from '../thunk/batchThunk';

const initialState = [];

const batchSlice = createSlice({
  name: 'batches',
  initialState,
  reducers: {
    setBatches(state, action) {
      return action.payload;
    },
    deleteBatch(state, action) {
      return state.filter(batch => batch.id !== action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchBatchesAsync.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(addBatchAsync.fulfilled, (state, action) => {
        state.push(action.payload);
      })
      .addCase(updateBatchAsync.fulfilled, (state, action) => {
        const { id, changes } = action.payload;
        const index = state.findIndex(b => b.id === id);
        if (index !== -1) {
          state[index] = { ...state[index], ...changes };
        }
      })
      .addCase(deleteBatchAsync.fulfilled, (state, action) => {
        return state.filter(batch => batch.id !== action.payload);
      });
  },
});

export const { setBatches, deleteBatch } = batchSlice.actions;
export default batchSlice.reducer;
