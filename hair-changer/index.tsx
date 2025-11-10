import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Poznámka: Registrácia Service Workera sa teraz spravuje priamo v súbore index.html,
// aby sa predišlo chybám časovania a zabezpečila sa maximálna spoľahlivosť.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
