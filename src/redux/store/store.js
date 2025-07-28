import { configureStore } from '@reduxjs/toolkit';
import studentReducer from '../slice/studentSlice';
import batchSlice from '../slice/batchSlice';
const store = configureStore({
  reducer: {
    students: studentReducer,
    batches: batchSlice,
  },
});

export default store;
