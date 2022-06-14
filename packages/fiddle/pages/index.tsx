import App from '../src/components/App';
import { configure } from 'mobx';

configure({
  enforceActions: 'never',
});

export default App;
