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

      let students = await response.json();
      console.log(
        `[fetchStudentsAsync] Received ${students.length} students from API.`,
      );

      // Normalize: Map _id to id in each student object
      students = students.map(student => ({
        ...student,
        id: student._id, // map _id to id for frontend consistency
      }));
      // Save each student into SQLite DB
      for (const [index, student] of students.entries()) {
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
      console.log('Update Id:>', id);
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
      console.log('[deleteStudentAsync] Start - ID:', id);

      // First, delete from local DB
      const dbResult = await deleteStudentFromDb(id);
      console.log('[deleteStudentAsync] deleteStudentFromDb result:', dbResult);

      // Then attempt server-side delete
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      console.log('[deleteStudentAsync] API DELETE status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          '[deleteStudentAsync] API DELETE FAILED:',
          response.status,
          errorText,
        );
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      console.log('[deleteStudentAsync] Successfully deleted student:', id);
      return id;
    } catch (err) {
      console.error('[deleteStudentAsync] Error:', err);
      return rejectWithValue(err.message || 'Delete Student Failed');
    }
  },
);
