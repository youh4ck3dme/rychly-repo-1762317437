
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '../config/firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db: Firestore = getFirestore(app); // Export db here for other services to use app instance

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, pass: string) => Promise<any>;
    signup: (email: string, pass: string) => Promise<any>;
    logout: () => Promise<void>;
    isDevMode: boolean;
    devCredits: number | null;
    devLogin: () => Promise<any>;
    decrementDevCredit: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDevMode, setIsDevMode] = useState<boolean>(false);
    const [devCredits, setDevCredits] = useState<number | null>(null);

    useEffect(() => {
        // Load dev mode state from localStorage
        const storedDevMode = localStorage.getItem('isDevMode');
        const storedDevCredits = localStorage.getItem('devCredits');
        if (storedDevMode === 'true' && storedDevCredits !== null) {
            setIsDevMode(true);
            setDevCredits(parseInt(storedDevCredits, 10));
        }

        const unsubscribe = onAuthStateChanged(auth, user => {
            setFirebaseUser(user);
            setLoading(false);
        });
        return unsubscribe; // Unsubscribe on cleanup
    }, []);
    
    // Derived currentUser: if in dev mode, provide a mock user, otherwise Firebase user
    const currentUser = isDevMode ? { uid: 'dev_user', email: 'dev@example.com' } as User : firebaseUser;

    const login = (email: string, pass: string) => {
        setIsDevMode(false); // Ensure dev mode is off for real login
        setDevCredits(null);
        localStorage.removeItem('isDevMode');
        localStorage.removeItem('devCredits');
        return signInWithEmailAndPassword(auth, email, pass);
    };

    const signup = (email: string, pass: string) => {
        setIsDevMode(false); // Ensure dev mode is off for real signup
        setDevCredits(null);
        localStorage.removeItem('isDevMode');
        localStorage.removeItem('devCredits');
        return createUserWithEmailAndPassword(auth, email, pass);
    };

    const logout = async () => {
        if (isDevMode) {
            setIsDevMode(false);
            setDevCredits(null);
            localStorage.removeItem('isDevMode');
            localStorage.removeItem('devCredits');
            setFirebaseUser(null); // Clear mock user
            return Promise.resolve();
        } else {
            return signOut(auth);
        }
    };

    const devLogin = () => {
        setIsDevMode(true);
        setDevCredits(20); // 20 attempts for dev mode
        localStorage.setItem('isDevMode', 'true');
        localStorage.setItem('devCredits', '20');
        // No Firebase user set, as we're in dev mode
        return Promise.resolve();
    };

    const decrementDevCredit = () => {
        if (isDevMode && devCredits !== null && devCredits > 0) {
            const newCredits = devCredits - 1;
            setDevCredits(newCredits);
            localStorage.setItem('devCredits', newCredits.toString());
        }
    };


    const value = {
        currentUser,
        loading,
        login,
        signup,
        logout,
        isDevMode,
        devCredits,
        devLogin,
        decrementDevCredit,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
