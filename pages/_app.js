import Layout from '../components/Layout';
import '../styles/globals.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-phone-input-2/lib/style.css';
import { RootProvider } from '../context/RootContext';

export default function App({ Component, pageProps }) {
  return (
    <RootProvider>
      <Layout>
        <Component {...pageProps} />
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
          limit={5}
          enableMultiContainer={false}
          closeButton={true}
          theme="light"
        />
      </Layout>
    </RootProvider>
  );
}
