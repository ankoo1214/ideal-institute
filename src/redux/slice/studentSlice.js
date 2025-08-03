import { createSlice } from '@reduxjs/toolkit';
import {
  addStudentAsync,
  updateStudentAsync,
  deleteStudentAsync,
  fetchStudentsAsync,
} from '../thunk/studentThunk';

const initialState = [];

const studentSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    setStudents(state, action) {
      return action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStudentsAsync.fulfilled, (state, action) => {
        // Replace the existing state with fetched students
        return action.payload;
      })
      .addCase(addStudentAsync.fulfilled, (state, action) => {
        // Add new student to state
        state.push(action.payload);
      })
      .addCase(updateStudentAsync.fulfilled, (state, action) => {
        const { id, changes } = action.payload;
        const index = state.findIndex(s => s.id === id);
        if (index >= 0) {
          state[index] = { ...state[index], ...changes };
        }
      })
      .addCase(deleteStudentAsync.fulfilled, (state, action) => {
        const id = action.payload;
        return state.filter(s => s.id !== id);
      });
    // Optionally, handle pending and rejected states for loading & error UI
  },
});

export const { setStudents } = studentSlice.actions;
export default studentSlice.reducer;
