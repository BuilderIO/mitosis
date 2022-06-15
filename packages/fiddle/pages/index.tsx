import { configure } from 'mobx';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/components/App'), { ssr: false });

configure({
  enforceActions: 'never',
});

export default App;
