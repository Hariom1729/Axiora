import { createSlice } from "@reduxjs/toolkit";

const getToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    return JSON.parse(token);
  } catch (error) {
    return token;
  }
};

const initialState = {
  loading: false,
  signupData: null,
  token: getToken(),
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    setToken(state, value) {
      state.token = value.payload;
    },
  },
});

export const { setLoading, setSignupData, setToken } = authSlice.actions;

export default authSlice.reducer;