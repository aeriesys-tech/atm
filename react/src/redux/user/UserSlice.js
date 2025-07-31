
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    token: null,
    user: null,
    notificationCount: 0,
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
        setNotificationCount: (state, action) => {
            // console.log(state, action)
            state.notificationCount = action.payload;
        },
    },
});

export const { setUser, updateUser, clearUser, setNotificationCount } = userSlice.actions;

export default userSlice.reducer;
