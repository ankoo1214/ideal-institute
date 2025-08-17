import { configureStore } from '@reduxjs/toolkit';
import studentReducer from '../slice/studentSlice';
import batchSlice from '../slice/batchSlice';
import teachersSlice from '../slice/facultySlice';
const store = configureStore({
  reducer: {
    students: studentReducer,
    batches: batchSlice,
    faculties: teachersSlice,
  },
});

export default store;
