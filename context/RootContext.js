import { AppProvider } from './AppContext';
import { UserProvider } from './UserContext';
import { WishlistProvider } from './WishlistContext';

// Root provider that combines all context providers
export const RootProvider = ({ children }) => {
  return (
    <UserProvider>
      <AppProvider>
        <WishlistProvider>
          {children}
        </WishlistProvider>
      </AppProvider>
    </UserProvider>
  );
};