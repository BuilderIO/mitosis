import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import { configure } from 'mobx';

configure({
  enforceActions: 'never',
});

ReactDOM.render(<App />, document.getElementById('root'));

if (process.env.NODE_ENV === 'development') {
  const { stopReportingRuntimeErrors } = require('react-error-overlay');
  // These freeze the browser when syntax highlighting, sometimes for **long** periods
  stopReportingRuntimeErrors();

  window.addEventListener('error', (event) => {
    // stopReportingRuntimeErrors() causes an issue with hot reload - so just refresh the whole page
    // when this known error throws. more info: https://github.com/facebook/create-react-app/issues/10611
    if (event.message.startsWith('Uncaught Error: Expected options to be injected.')) {
      window.location.reload();
    }
  });
}
