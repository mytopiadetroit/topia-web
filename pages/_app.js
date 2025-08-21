import { useEffect } from 'react';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-phone-input-2/lib/style.css';
import { RootProvider } from '../context/RootContext';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    
    const script = document.createElement('script');
    script.src = 'https://embed.tawk.to/68a6df3bc7b5501923c9a4e4/1j35tg0d7';
    script.async = true;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    
   
    const handleLoad = () => {
      console.log('Tawk.to script loaded successfully');
    };
    
    script.addEventListener('load', handleLoad);
    document.head.appendChild(script);
    
    
    return () => {
      script.removeEventListener('load', handleLoad);
     
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
     
      if (window.Tawk_API) {
        window.Tawk_API = undefined;
      }
    };
  }, []);

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