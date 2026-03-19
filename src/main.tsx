import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import './index.css';

// Mobile-first navigation flow: /pages → /pages/:pageId → /pages/:pageId/sections/:sectionId
// Legacy App.tsx is still available if needed, but new flow uses screens/

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppShell />
        </BrowserRouter>
    </React.StrictMode>,
);
