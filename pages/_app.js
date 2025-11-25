import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import AgeVerification from '../components/AgeVerification';
import '../styles/globals.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-phone-input-2/lib/style.css';
import { RootProvider } from '../context/RootContext';
import { useUser } from '../context/UserContext';

function AppContent({ Component, pageProps }) {
  const router = useRouter();
  const { isLoggedIn, user, loading } = useUser();
  
  // Skip age verification for logged-in users
  const shouldShowAgeVerification = !isLoggedIn;

  const checkUserStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return null;

      const response = await fetch('https://api.mypsyguide.io/api/auth/profile', {
        headers: {
          'Authorization': `jwt ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.user?.status;
      }
      return null;
    } catch (error) {
      console.error('Error checking user status:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // If not logged in or already on the login page, don't check status
    if (!isLoggedIn || router.pathname === '/auth/login') {
      return;
    }

    // Skip if still loading
    if (loading) {
      console.log('App loading, skipping redirection check');
      return;
    }

    const verifyUserStatus = async () => {
      try {
        const status = await checkUserStatus();
        console.log('User status from API:', status);
        
        // Only redirect to suspend page if user is logged in AND status is 'suspend'
        // and not already on the suspend page
        if (isLoggedIn && status === 'suspend' && router.pathname !== '/suspend') {
          console.log('User is suspended, redirecting to suspend page');
          router.push('/suspend');
        }
        // If user is not suspended and somehow on suspend page, redirect them away
        else if (isLoggedIn && status !== 'suspend' && router.pathname === '/suspend') {
          console.log('User is not suspended, redirecting to home');
          router.push('/');
        }
      } catch (error) {
        console.error('Error in verifyUserStatus:', error);
      }
    };

    verifyUserStatus();
  }, [isLoggedIn, loading, router, user]);

  // Conditionally wrap with AgeVerification only for non-logged-in users
  const content = (
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
  );

  return shouldShowAgeVerification ? (
    <AgeVerification>{content}</AgeVerification>
  ) : (
    content
  );
}

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
      <AppContent Component={Component} pageProps={pageProps} />
    </RootProvider>
  );
}