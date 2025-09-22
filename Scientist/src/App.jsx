import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import AuthProvider from './contexts/AuthContext';
import './App.css';

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
