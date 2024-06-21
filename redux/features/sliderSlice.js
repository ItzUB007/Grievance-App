// sliderSlice.js
import { createSlice } from '@reduxjs/toolkit';

const sliderSlice = createSlice({
  name: 'slider',
  initialState: {
    isOn: true,
  },
  reducers: {
    toggleSlider: (state) => {
      state.isOn = !state.isOn;
    },
    setSlider: (state, action) => {
      state.isOn = action.payload;
    },
  },
});

export const { toggleSlider, setSlider } = sliderSlice.actions;

export default sliderSlice.reducer;
