import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  userInfo: {  // 修改 userInfo 的结构
    id: null,
    role: null,
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    setUserInfo: (state, action) => {
      state.userInfo = {
        id: action.payload.id,
        role: action.payload.role,
      };
    },
    clearUser: (state) => {
      state.token = null;
      state.userInfo = {
        id: null,
        role: null,
      };
      localStorage.removeItem('token');
    },
  },
});

export const { setToken, setUserInfo, clearUser } = userSlice.actions;

export default userSlice.reducer;
