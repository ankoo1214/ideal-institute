import { createSlice } from '@reduxjs/toolkit';

const studentSlice = createSlice({
  name: 'students',
  initialState: [],
  reducers: {
    addStudent: (state, action) => {
      state.push(action.payload);
    },
    setStudents: (state, action) => {
      return action.payload;
    },
    updateStudent: (state, action) => {
      const { id, changes } = action.payload;
      const index = state.findIndex(s => s.id === id);
      if (index !== -1) {
        state[index] = { ...state[index], ...changes };
      }
    },
    deleteStudent: (state, action) => {
      const id = action.payload;
      return state.filter(student => student.id !== id);
    },
  },
});

export const { addStudent, setStudents, updateStudent, deleteStudent } =
  studentSlice.actions;
export default studentSlice.reducer;
