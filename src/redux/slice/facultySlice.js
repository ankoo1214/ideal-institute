// redux/slices/teachersSlice.js

import { createSlice } from '@reduxjs/toolkit';
import {
  fetchTeachersAsync,
  addTeacherAsync,
  updateTeacherAsync,
  deleteTeacherAsync,

} from '../thunk/facultyThunk'; // import your existing thunks

const initialState = {
  teachers: [],
  loading: false,
  error: null,
};

const teachersSlice = createSlice({
  name: 'faculties',
  initialState,
  reducers: {
    clearTeachersError(state) {
      state.error = null;
    },
    setTeachers(state, action) {
      state.teachers = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // Fetch Teachers
      .addCase(fetchTeachersAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeachersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = action.payload;
      })
      .addCase(fetchTeachersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Add Teacher
      .addCase(addTeacherAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeacherAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers.unshift(action.payload); // add new teacher at start
      })
      .addCase(addTeacherAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Update Teacher
      .addCase(updateTeacherAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTeacherAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { id, changes } = action.payload;
        const index = state.teachers.findIndex(t => t.id === id);
        if (index !== -1) {
          state.teachers[index] = {
            ...state.teachers[index],
            ...changes,
          };
        }
      })
      .addCase(updateTeacherAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      // Delete Teacher
      .addCase(deleteTeacherAsync.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTeacherAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.teachers = state.teachers.filter(t => t.id !== action.payload);
      })
      .addCase(deleteTeacherAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

    //   // Delete Multiple Teachers
    //   .addCase(deleteMultipleTeachersAsync.pending, state => {
    //     state.loading = true;
    //     state.error = null;
    //   })
    //   .addCase(deleteMultipleTeachersAsync.fulfilled, (state, action) => {
    //     state.loading = false;
    //     const idsToDelete = action.payload; // array of deleted ids
    //     state.teachers = state.teachers.filter(
    //       t => !idsToDelete.includes(t.id),
    //     );
    //   })
    //   .addCase(deleteMultipleTeachersAsync.rejected, (state, action) => {
    //     state.loading = false;
    //     state.error = action.payload || action.error.message;
    //   });
  },
});

export const { clearTeachersError, setTeachers } = teachersSlice.actions;

export default teachersSlice.reducer;
