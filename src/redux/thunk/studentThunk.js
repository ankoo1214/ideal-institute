import { createAsyncThunk } from '@reduxjs/toolkit';
import { insertTable } from '../../db/insertTable';
import { deleteStudentFromDb } from '../../db/deleteQuery';
import { fetchTable } from '../../db/fetchTable';

const API_URL = 'https://ideal-server-6c83.onrender.com/api/students';
export const fetchStudentsAsync = createAsyncThunk(
  'students/fetchStudentsAsync',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[fetchStudentsAsync] Starting fetch from API:', API_URL);
      const response = await fetch(API_URL);

      if (!response.ok) {
        const errMsg = `Server responded with status ${response.status}`;
        console.error('[fetchStudentsAsync] Fetch failed:', errMsg);
        throw new Error(errMsg);
      }

      const students = await response.json();
      console.log(
        `[fetchStudentsAsync] Received ${students.length} students from API.`,
      );

      // Save each student into SQLite DB
      for (const [index, student] of students.entries()) {
        7894567612;
        try {
          await insertTable('STUDENTS', student);
          console.log(
            `[fetchStudentsAsync] Inserted student ${
              student.id || index
            } into SQLite.`,
          );
        } catch (sqliteErr) {
          console.error(
            `[fetchStudentsAsync] Failed to insert student ${
              student.id || index
            } into SQLite:`,
            sqliteErr,
          );
          // You may continue or break here depending on severity
        }
      }

      console.log('[fetchStudentsAsync] All students synced to SQLite.');

      return students;
    } catch (error) {
      console.warn(
        '[fetchStudentsAsync] Fetch from API failed:',
        error.message,
      );

      // Try fallback: fetch from local SQLite database
      try {
        console.log(
          '[fetchStudentsAsync] Attempting to load students from local SQLite.',
        );
        const localStudents = await fetchTable('STUDENTS');
        console.log(
          `[fetchStudentsAsync] Loaded ${localStudents.length} students from SQLite.`,
        );
        return localStudents;
      } catch (localError) {
        console.error(
          '[fetchStudentsAsync] Failed to load students from SQLite:',
          localError,
        );
        return rejectWithValue(
          localError.message ||
            'Failed to load students from both API and SQLite.',
        );
      }
    }
  },
);

export const addStudentAsync = createAsyncThunk(
  'students/addStudentAsync',
  async (studentObj, { rejectWithValue }) => {
    try {
      await insertTable('STUDENTS', studentObj);
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentObj),
      });
      return studentObj;
    } catch (err) {
      return rejectWithValue(err.message || 'Add Student Failed');
    }
  },
);

export const updateStudentAsync = createAsyncThunk(
  'students/updateStudentAsync',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      await insertTable('STUDENTS', { ...changes, id });
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      return { id, changes };
    } catch (err) {
      return rejectWithValue(err.message || 'Update Student Failed');
    }
  },
);

export const deleteStudentAsync = createAsyncThunk(
  'students/deleteStudentAsync',
  async (id, { rejectWithValue }) => {
    try {
      await deleteStudentFromDb(id);
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Delete Student Failed');
    }
  },
);
