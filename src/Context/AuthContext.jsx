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

  useEffect(() => {
    if (error) {
      let errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
      let errorSlice = errorMessage.slice(0, 50);
      toast.error(errorSlice, toastObj);
      setError(null);
    }
  }, [error]);

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
    if (password.length < 6) {
      setError("Password should be at least 6 characters");
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
        setError("User not found. Please Sign up.");
        break;
      case "auth/wrong-password":
        setError("Incorrect password. Please try again.");
        break;
      case "auth/invalid-email":
        setError("Invalid email format.");
        break;
      case "auth/network-request-failed":
        setError("Network error. Check connection.");
        break;
      default:
        setError("An error occurred. Please try again.");
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
    setError(null);
    setLoading(true);
  
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
  
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
    } catch (error) {
      setError(error.code);
      console.error("Google Sign-in error:", error.code, error.message);
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
