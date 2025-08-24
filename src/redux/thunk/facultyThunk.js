import { createAsyncThunk } from '@reduxjs/toolkit';
import { insertTable } from '../../db/insertTable';
import { deleteStudentFromDb, deleteTeacherFromDb } from '../../db/deleteQuery'; // You need to implement
import { fetchTable } from '../../db/fetchTable';
import { deleteStudent } from '../slice/studentSlice';
import { updateInDb } from '../../db/updateQuery';

const API_URL = 'https://ideal-server-6c83.onrender.com/api/teachers'; // Change to correct URL
// https://ideal-server-6c83.onrender.com/api/teachers
const fetchTeachers = async () => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch teachers');
    }
    const data = await response.json();
    console.log('Teachers: ', data);
  } catch (error) {
    console.error('Error fetching teachers: ', error.message);
  }
};

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

      let teachers = await response.json();

      // Normalize _id to id for frontend consistency
      teachers = teachers.map(teacher => ({
        ...teacher,
        id: teacher._id,
      }));

      // Save all teachers into SQLite sequentially
      for (const [i, teacher] of teachers.entries()) {
        try {
          await insertTable('FACULTIES', teacher);
          console.log(
            `[fetchTeachersAsync] Inserted teacher ${
              teacher.id || i
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
      console.warn('[fetchTeachersAsync] Fetch failed:', error.message);

      // Fallback: fetch from SQLite
      try {
        console.log(
          '[fetchTeachersAsync] Loading teachers from SQLite fallback...',
        );
        let sqliteTeachers = await fetchTable('FACULTIES');

        // Normalize local data too if needed
        sqliteTeachers = sqliteTeachers.map(teacher => ({
          ...teacher,
          id: teacher._id || teacher.id,
        }));

        console.log(
          `[fetchTeachersAsync] Loaded ${sqliteTeachers.length} teachers from SQLite.`,
        );
        return sqliteTeachers;
      } catch (sqliteError) {
        console.error('[fetchTeachersAsync] Failed SQLite fetch:', sqliteError);
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
      console.log('Faculty Add:---->', teacherObj);

      await insertTable('FACULTIES', teacherObj); // Local SQLite save
      console.log('Form data:>', formData);
      const formData = new FormData();

      // Append text fields
      for (const key in teacherObj) {
        console.log('Formdata and Key:>', key);
        if (key !== 'avatar' && teacherObj[key]) {
          formData.append(key, teacherObj[key]);
        }
      }

      // Append avatar
      if (teacherObj.avatar) {
        console.log('teacherObject:>', teacherObj.avatar);
        formData.append('avatar', {
          uri: teacherObj.avatar,
          name: teacherObj.avatar.fileName || 'avatar.jpg',
          type: teacherObj.avatar.type || 'image/jpeg',
        });
      } else if (typeof teacherObj.avatar === 'string') {
        formData.append('avatar', teacherObj.avatar);
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData, // 👈 No headers, RN sets Content-Type
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
      console.log('👉 UpdateTeacherAsync called with:', { id, changes });

      // Update on local DB
      console.log('🔄 Updating in Local DB...');
      const localUpdate = await updateInDb('FACULTIES', id, changes);
      console.log('✅ Local DB update success:', localUpdate);

      // Update on backend API
      console.log(`🌐 Sending PUT request to API: ${API_URL}/${id}`);
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('❌ API update failed:', errText);
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      const responseData = await response.json();
      console.log('✅ API update success:', responseData);

      return { id, changes };
    } catch (error) {
      console.error('🚨 Update teacher failed:', error);
      return rejectWithValue(error.message || 'Failed to update teacher.');
    }
  },
);

export const deleteTeacherAsync = createAsyncThunk(
  'teachers/deleteTeacherAsync',
  async (id, { rejectWithValue }) => {
    try {
      console.log('[deleteTeacherAsync] Deleting teacher with id:', id);

      if (!id) {
        const errorMsg = 'No valid teacher ID provided for deletion.';
        console.error('[deleteTeacherAsync]', errorMsg);
        return rejectWithValue(errorMsg);
      }

      // Delete from local DB
      const dbResult = await deleteStudentFromDb(id);
      console.log('[deleteTeacherAsync] Deleted from DB:', dbResult);

      // Delete from backend API
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      console.log('[deleteTeacherAsync] API response status:', response.status);

      if (!response.ok) {
        const errorPayload = await response.text();
        console.error(
          '[deleteTeacherAsync] API deletion failed:',
          errorPayload,
        );
        throw new Error(`API deletion failed: ${errorPayload}`);
      }

      console.log('[deleteTeacherAsync] Teacher successfully deleted:', id);

      return id;
    } catch (error) {
      console.error('[deleteTeacherAsync] Error during deletion:', error);
      return rejectWithValue(error.message || 'Failed to delete teacher.');
    }
  },
);
