import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';

createRoot(document.getElementById('root')!).render(
  <Home recordPortal="https://haeparang-coast-map.icreamice.chatgpt.site/" homeHref="./"/>
);
