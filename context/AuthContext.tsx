import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { auth, database } from '../config/firebase';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { onAuthStateChanged, signInWithCredential, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { Alert } from 'react-native';
import { ref, set } from 'firebase/database';

interface AuthContextProps {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    user: null,
    loading: true,
    signInWithGoogle: async () => { },
    logout: async () => { }
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Configure Google Sign-In
        GoogleSignin.configure({
            scopes: ['https://www.googleapis.com/auth/calendar'],
            webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
            offlineAccess: true,
        });

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        try {
            setLoading(true);

            // Check if already signed in and sign out first to ensure fresh login
            await GoogleSignin.signOut();

            // Start Google Sign-In
            await GoogleSignin.signIn();

            // Get the tokens - this is where we get the idToken
            const { idToken } = await GoogleSignin.getTokens();

            // Create a Google credential with the token
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign in with Firebase using the Google credential
            const userCredential = await signInWithCredential(auth, googleCredential);

            // Save user info in database if it's a new user
            if (userCredential.user) {
                const userRef = ref(database, `users/${userCredential.user.uid}`);
                await set(userRef, {
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName,
                    photoURL: userCredential.user.photoURL,
                    lastLogin: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            Alert.alert('Authentication Error', 'Failed to sign in with Google. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            setLoading(true);
            await GoogleSignin.signOut();
            await signOut(auth);
        } catch (error) {
            console.error('Logout Error:', error);
            Alert.alert('Logout Error', 'Failed to log out. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
};