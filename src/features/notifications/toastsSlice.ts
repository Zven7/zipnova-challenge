import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';

export type ToastTone = 'success' | 'error';
export type Toast = { id: string; tone: ToastTone; message: string };

export const toastsSlice = createSlice({
  name: 'toasts',
  initialState: [] as Toast[],
  reducers: {
    showToast: {
      reducer(state, action: PayloadAction<Toast>) {
        state.push(action.payload);
      },
      prepare(toast: Omit<Toast, 'id'>) {
        return { payload: { ...toast, id: nanoid() } };
      },
    },
    dismissToast(state, action: PayloadAction<string>) {
      return state.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { showToast, dismissToast } = toastsSlice.actions;
