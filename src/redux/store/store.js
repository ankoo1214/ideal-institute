import { configureStore } from '@reduxjs/toolkit';
import studentReducer from '../slice/studentSlice';

const store = configureStore({
  reducer: {
    students: studentReducer, // This key matches what you use in useSelector(state => state.students)
  },
});

export default store;
