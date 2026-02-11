import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from './router';
import './index.css';

// Mobile-first navigation flow: /pages → /pages/:pageId → /pages/:pageId/sections/:sectionId
// Legacy App.tsx is still available if needed, but new flow uses screens/

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <AppRouter />
        </BrowserRouter>
    </React.StrictMode>,
);
