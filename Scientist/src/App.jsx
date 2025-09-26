import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import AuthProvider from './contexts/AuthContext';
import { AppDataProvider } from './contexts/DataContext';
import './App.css';

const App = () => {
  return (
    <AppDataProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppDataProvider>
  );
};

export default App;
