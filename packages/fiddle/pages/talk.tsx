import { configure } from 'mobx';
import dynamic from 'next/dynamic';
import Head from 'next/head';

const App = dynamic(() => import('../src/components/App'), { ssr: false });

configure({
  enforceActions: 'never',
});

export default () => {
  return (
    <>
      <Head>
        <title>Mitosis Fiddle - compile to common frameworks, import from popular tools</title>
      </Head>
      <App talk />
    </>
  );
};
