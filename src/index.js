import {StrictMode} from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.jsx';
import {NotifierProvider} from './NotifierContext.jsx';

const root = document.getElementById('root');
if (!root) {
  throw new Error("The element #root wasn't found");
}

ReactDOM.createRoot(root).render(
  // 🤢🤢🤢 🤮🤮🤮
  <StrictMode>
    <NotifierProvider>
      <App />
    </NotifierProvider>
  </StrictMode>
);
