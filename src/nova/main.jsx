import '@fontsource-variable/geist';
import './nova.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import NovaPage from './NovaPage.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NovaPage />
  </React.StrictMode>
);
