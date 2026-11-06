import '@fontsource-variable/geist';
import '../nova/shared.css';
import './center.css';
import './pipeline.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import CenterPage from './CenterPage.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CenterPage />
  </React.StrictMode>
);
