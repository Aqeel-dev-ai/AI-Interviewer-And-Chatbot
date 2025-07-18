import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDoc,
  serverTimestamp,
  setDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "../utilities/firebase";
import { Bounce, toast } from "react-toastify";

const AuthContext = createContext({
  signup: () => {},
  loading: false,
  error: null,
  setError: () => {},
  signInWithGoogle: () => {},
  signIn: () => {},
  User: null,
  fetchedUser: true,
  toastObj: {},
  signupNameRef: null,
  signupEmailRef: null,
  signupPasswordRef: null,
  handleSignupSubmit: () => {},
  LoginEmailRef: null,
  LoginPasswordRef: null,
  handleLoginSubmit: () => {},
  handleLogout: () => {},
});

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchedUser, setFetchedUser] = useState(false);
  const [User, setUser] = useState(null);

  const toastObj = {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "dark",
    transition: Bounce,
  };

  const signupNameRef = useRef();
  const signupEmailRef = useRef();
  const signupPasswordRef = useRef();

  const LoginEmailRef = useRef();
  const LoginPasswordRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user || null);
      setFetchedUser(true);
    });
    return () => unsubscribe();
  }, []);

  const formValidation = (email, password, name = null) => {
    if (name !== null && name.trim() === "") {
      setError("Please fill all fields");
      return false;
    }
    if (email.trim() === "" || password.trim() === "") {
      setError("Please fill all fields");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    if (password.length < 8) {
      setError("Password should be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleAuthError = (error) => {
    switch (error) {
      case "auth/email-already-in-use":
        setError("Email already registered. Please Login.");
        break;
      case "auth/user-not-found":
        setError("Invalid Credentials");
        break;
      case "auth/wrong-password":
        setError("Invalid Credentials");
        break;
      case "auth/invalid-email":
        setError("Invalid email format.");
        break;
      case "auth/network-request-failed":
        setError("Network error. Check connection.");
        break;
      case "auth/popup-closed-by-user":
        setError("Sign-in was cancelled");
        break;
      case "auth/popup-blocked":
        setError("Pop-up was blocked. Please allow pop-ups for this site.");
        break;
      case "auth/operation-not-allowed":
        setError("Google sign-in is not enabled. Please contact support.");
        break;
      case "permission-denied":
        setError("Database access denied. Please contact support.");
        break;
      default:
        setError("Invalid Credentials");
    }
  };

  const signup = async (email, password, name, navigate) => {
    setError(null);

    if (!formValidation(email, password, name)) {
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password).then(
        (userCredential) => {
          const user = userCredential.user;
          setDoc(doc(db, "users", user.uid), {
            name,
            email,
            createdAt: serverTimestamp(),
            UserId: user.uid,
          });
        }
      );
      navigate("/login");
    } catch (error) {
      handleAuthError(error.code);
    } finally {
      setLoading(false);
    }
  };
 
  const signInWithGoogle = async (navigate) => {
    const provider = new GoogleAuthProvider();
    // Add custom parameters to avoid popup issues
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    setError(null);
    setLoading(true);
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            createdAt: serverTimestamp(),
            UserId: user.uid,
          });
        }
  
        navigate("/app");
      } catch (firestoreError) {
        console.error("Firestore error:", firestoreError);
        setError("Database error. Please try again.");
      }
    } catch (error) {
      console.error("Google Sign-in error:", error.code, error.message);
      
      // Handle specific error cases
      switch (error.code) {
        case "auth/popup-closed-by-user":
          setError("Sign-in was cancelled");
          break;
        case "auth/popup-blocked":
          setError("Pop-up was blocked. Please allow pop-ups for this site.");
          break;
        case "auth/operation-not-allowed":
          setError("Google sign-in is not enabled. Please contact support.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your connection.");
          break;
        default:
          setError("Sign-in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  const signIn = async (email, password, navigate) => {
    setError(null);
    if (!formValidation(email, password)) {
      return;
    }
  
    setLoading(true);
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
  
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || "", // Email/Password users may not have displayName
          email: user.email,
          createdAt: serverTimestamp(),
          UserId: user.uid,
        });
      }
  
      navigate("/app");
    } catch (error) {
      handleAuthError(error.code);
      console.error("Email/Password Sign-in error:", error.code, error.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSignupSubmit = async (navigate) => {
    console.log("handleSignupSubmit called with navigate:", navigate);
    console.log("Email:", signupEmailRef.current?.value);
    console.log("Password:", signupPasswordRef.current?.value);
    console.log("Name:", signupNameRef.current?.value);
    
    const success = await signup(
      signupEmailRef.current.value,
      signupPasswordRef.current.value,
      signupNameRef.current.value,
      navigate
    );
    if (success) {
      signupEmailRef.current.value = "";
      signupPasswordRef.current.value = "";
      signupNameRef.current.value = "";
    }
  };

  const handleLoginSubmit = async (navigate) => {
    const success = await signIn(
      LoginEmailRef.current.value,
      LoginPasswordRef.current.value,
      navigate
    );
    if (success) {
      LoginEmailRef.current.value = "";
      LoginPasswordRef.current.value = "";
    }
  };

  const handleLogout = (navigate) => {
    signOut(auth)
      .then(() => {
        toast.success("Signout Succesfully", toastObj);
        if (navigate) navigate("/");
      })
      .catch((error) => {
        setError(error.code);
      });
  };

  return (
    <AuthContext.Provider
      value={{
        handleLogout,
        signup,
        loading,
        error,
        setError,
        signInWithGoogle,
        signIn,
        User,
        fetchedUser,
        toastObj,
        signupNameRef,
        signupEmailRef,
        signupPasswordRef,
        handleSignupSubmit,
        LoginEmailRef,
        LoginPasswordRef,
        handleLoginSubmit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
