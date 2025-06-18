
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AuthModal from '@/components/AuthModal';
import { auth, googleProvider } from '@/lib/firebase'; // Import Firebase auth instance and Google provider
import { 
  User,
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  loginUser: (email: string, pass: string) => Promise<void>;
  registerUser: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  showAuthModal: boolean;
  openAuthModal: (initialView?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authModalView: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // To handle initial auth state check
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoggedIn(!!user);
      setLoading(false);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const loginUser = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      toast({ title: 'Login Successful', description: 'Welcome back!' });
      closeAuthModal();
    } catch (error: any) {
      console.error("Firebase login error:", error);
      toast({ title: 'Login Failed', description: error.message || 'Could not log in.', variant: 'destructive' });
      throw error;
    }
  };

  const registerUser = async (email: string, pass: string, name?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user && name) {
        await updateProfile(userCredential.user, { displayName: name });
        // Re-fetch or update currentUser state if necessary, though onAuthStateChanged should handle it
        setCurrentUser(auth.currentUser); 
      }
      toast({ title: 'Registration Successful', description: 'Your account has been created.' });
      closeAuthModal();
    } catch (error: any) {
      console.error("Firebase registration error:", error);
      toast({ title: 'Registration Failed', description: error.message || 'Could not register.', variant: 'destructive' });
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast({ title: 'Google Sign-In Successful', description: 'Welcome!' });
      closeAuthModal();
    } catch (error: any) {
      console.error("Firebase Google sign-in error:", error);
      toast({ title: 'Google Sign-In Failed', description: error.message || 'Could not sign in with Google.', variant: 'destructive' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    } catch (error: any) {
      console.error("Firebase logout error:", error);
      toast({ title: 'Logout Failed', description: error.message || 'Could not log out.', variant: 'destructive' });
    }
  };

  const openAuthModal = (initialView: 'login' | 'register' = 'login') => {
    setAuthModalView(initialView);
    setShowAuthModal(true);
  };
  const closeAuthModal = () => setShowAuthModal(false);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      isLoggedIn, 
      loading,
      loginUser, 
      registerUser, 
      signInWithGoogle,
      logout, 
      showAuthModal, 
      openAuthModal, 
      closeAuthModal, 
      authModalView 
    }}>
      {!loading && children}
      {showAuthModal && <AuthModal isOpen={showAuthModal} onClose={closeAuthModal} initialView={authModalView} />}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
