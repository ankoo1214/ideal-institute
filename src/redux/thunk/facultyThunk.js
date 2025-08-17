import { createAsyncThunk } from '@reduxjs/toolkit';
import { insertTable } from '../../db/insertTable';
import { deleteTeacherFromDb } from '../../db/deleteQuery'; // You need to implement
import { fetchTable } from '../../db/fetchTable';

const API_URL = 'https://ideal-server-6c83.onrender.com/api/teachers'; // Change to correct URL
// https://ideal-server-6c83.onrender.com/api/teachers
export const fetchTeachersAsync = createAsyncThunk(
  'teachers/fetchTeachersAsync',
  async (_, { rejectWithValue }) => {
    try {
      console.log('[fetchTeachersAsync] Fetching teachers from API...');
      const response = await fetch(API_URL);

      if (!response.ok) {
        const errorMsg = `API responded with status ${response.status}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      const teachers = await response.json();
      console.log(`[fetchTeachersAsync] Received ${teachers.length} teachers.`);

      // Save all teachers into SQLite sequentially
      for (const [i, teacher] of teachers.entries()) {
        try {
          await insertTable('FACULTIES', teacher);
          console.log(
            `[fetchTeachersAsync] Inserted teacher ${
              teacher.fId || i
            } into SQLite.`,
          );
        } catch (sqliteError) {
          console.error(
            `[fetchTeachersAsync] Failed to insert teacher ${teacher.id || i}:`,
            sqliteError,
          );
        }
      }

      return teachers;
    } catch (error) {
      console.warn('[fetchTeachersAsync] API fetch failed:', error.message);

      // Fallback: fetch from SQLite DB
      try {
        console.log(
          '[fetchTeachersAsync] Loading teachers from local SQLite as fallback...',
        );
        const sqliteTeachers = await fetchTable('TEACHERS');
        console.log(
          `[fetchTeachersAsync] Loaded ${sqliteTeachers.length} teachers from SQLite.`,
        );
        return sqliteTeachers;
      } catch (sqliteError) {
        console.error(
          '[fetchTeachersAsync] Failed to fetch teachers from SQLite:',
          sqliteError,
        );
        return rejectWithValue(
          sqliteError.message ||
            'Failed to fetch teachers from API and SQLite.',
        );
      }
    }
  },
);
export const addTeacherAsync = createAsyncThunk(
  'teachers/addTeacherAsync',
  async (teacherObj, { rejectWithValue }) => {
    try {
      console.log('Faculty Add:>', teacherObj);

      await insertTable('FACULTIES', teacherObj); // Local SQLite

      const formData = new FormData();

      // Append all text fields
      for (const key in teacherObj) {
        if (key !== 'avatar' && teacherObj[key]) {
          formData.append(key, teacherObj[key]);
        }
      }

      // Append image correctly
      if (
        teacherObj.avatar &&
        typeof teacherObj.avatar === 'object' &&
        teacherObj.avatar.uri
      ) {
        formData.append('avatar', {
          uri: teacherObj.avatar.uri,
          name: teacherObj.avatar.fileName || 'avatar.jpg',
          type: teacherObj.avatar.type || 'image/jpeg',
        });
      } else {
        console.warn('⚠️ Avatar is not a valid image object');
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Failed to add teacher');
      }

      const savedData = await response.json();
      return savedData;
    } catch (error) {
      console.error('🔥 Error uploading teacher:', error);
      return rejectWithValue(error.message || 'Failed to add teacher.');
    }
  },
);

export const updateTeacherAsync = createAsyncThunk(
  'teachers/updateTeacherAsync',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      // Update on local DB
      await insertTable('FACULTIES', { id, ...changes });

      // Update on backend API
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      return { id, changes };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update teacher.');
    }
  },
);

export const deleteTeacherAsync = createAsyncThunk(
  'teachers/deleteTeacherAsync',
  async (id, { rejectWithValue }) => {
    try {
      // Delete from local DB
      await deleteTeacherFromDb(id);

      // Delete from backend API
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete teacher.');
    }
  },
);
