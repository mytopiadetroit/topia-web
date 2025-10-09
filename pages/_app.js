import { useEffect } from 'react';
import Layout from '../components/Layout';
import AgeVerification from '../components/AgeVerification';
import '../styles/globals.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-phone-input-2/lib/style.css';
import { RootProvider } from '../context/RootContext';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Check if Tawk.to is already loaded
    if (window.Tawk_API) {
      console.log('Tawk.to already loaded');
      return;
    }

    // Check if script is already in the DOM
    if (document.getElementById('tawk-script')) {
      console.log('Tawk.to script already exists');
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.id = 'tawk-script';
    script.async = true;
    script.charset = 'UTF-8';
    script.crossOrigin = 'anonymous';
    script.src = 'https://embed.tawk.to/68a6df3bc7b5501923c9a4e4/1j35tg0d7';

    // Set up error handling
    let scriptError = false;
    const errorHandler = (error) => {
      if (scriptError) return;
      scriptError = true;
      console.error('Tawk.to script error:', error);
      // Fallback: Load Tawk.to using alternative method
      if (!window.Tawk_API) {
        console.log('Trying alternative Tawk.to loading method...');
        const fallbackScript = document.createElement('script');
        fallbackScript.text = `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/68a6df3bc7b5501923c9a4e4/1j35tg0d7';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `;
        document.head.appendChild(fallbackScript);
      }
    };

    // Set up event handlers
    script.onerror = errorHandler;
    script.onload = () => {
      if (scriptError) return;
      console.log('Tawk.to script loaded successfully');
      
      // Check if Tawk_API is available
      if (window.Tawk_API) {
        console.log('Tawk_API is available');
        window.Tawk_API.onLoad = function() {
          console.log('Tawk.to API is ready');
        };
      } else {
        console.warn('Tawk_API not found after script load');
      }
    };

    // Add script to document
    document.head.appendChild(script);

    // Set timeout to check if script loaded
    const loadCheck = setTimeout(() => {
      if (!window.Tawk_API) {
        console.warn('Tawk.to did not load within timeout');
        errorHandler(new Error('Load timeout'));
      }
    }, 5000);

    // Cleanup function
    return () => {
      clearTimeout(loadCheck);
      const script = document.getElementById('tawk-script');
      if (script) {
        script.remove();
      }
      // Don't delete Tawk_API as it might be used by other components
    };
  }, []);

  return (
    <RootProvider>
      <AgeVerification>
        <Layout>
          <Component {...pageProps} />
          <ToastContainer 
            position="bottom-left"
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
      </AgeVerification>
    </RootProvider>
  );
}