import '@jsx-lite/core/dist/src/jsx-types';
import Footer from '../components/footer.lite';
import Header from '../components/header.lite';

export default function Home() {
  return (
    <div>
      <Header />

      <div style={{ padding: '20px' }}>I am the page body</div>

      <Footer />
    </div>
  );
}
