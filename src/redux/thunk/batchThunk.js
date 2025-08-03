import { createAsyncThunk } from '@reduxjs/toolkit';
import { insertTable } from '../../db/insertTable'; // SQLite
import { deleteBatchFromDb } from '../../db/deleteQuery'; // SQLite delete

const API_URL = 'http://localhost:4000/api/batches';

export const addBatchAsync = createAsyncThunk(
  'batches/addBatchAsync',
  async (batchObj, { rejectWithValue }) => {
    try {
      await insertTable('BATCHES', batchObj);
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchObj),
      });
      return batchObj;
    } catch (err) {
      return rejectWithValue(err.message || 'Add Batch Failed');
    }
  },
);

export const updateBatchAsync = createAsyncThunk(
  'batches/updateBatchAsync',
  async ({ id, changes }, { rejectWithValue }) => {
    try {
      await insertTable('BATCHES', { ...changes, id });
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changes),
      });
      return { id, changes };
    } catch (err) {
      return rejectWithValue(err.message || 'Update Batch Failed');
    }
  },
);

export const deleteBatchAsync = createAsyncThunk(
  'batches/deleteBatchAsync',
  async (id, { rejectWithValue }) => {
    try {
      await deleteBatchFromDb(id);
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Delete Batch Failed');
    }
  },
);
