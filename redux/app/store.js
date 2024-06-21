// store.js
import { configureStore } from '@reduxjs/toolkit';
import sliderReducer from '../features/sliderSlice';

const store = configureStore({
  reducer: {
    slider: sliderReducer,
  },
});

export default store;
