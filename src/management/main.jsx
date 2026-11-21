import '@fontsource-variable/inter';
import './bento.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ManagementBento from './ManagementBento.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ManagementBento />
  </React.StrictMode>
);
