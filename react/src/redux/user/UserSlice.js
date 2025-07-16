
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: null,
    user: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
        },
        updateUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        clearUser: (state) => {
            state.token = null;
            state.user = null;
        },
    },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
