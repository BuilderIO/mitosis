import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import reportWebVitals from './reportWebVitals';
import { configure } from 'mobx';

configure({
  enforceActions: 'never',
});

if (process.env.NODE_ENV === 'development') {
  const { stopReportingRuntimeErrors } = require('react-error-overlay');
  // These freeze the browser when syntax highlighting, sometimes for **long** periods
  stopReportingRuntimeErrors();
}

ReactDOM.render(<App />, document.getElementById('root'));

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
