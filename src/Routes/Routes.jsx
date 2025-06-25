import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "../Context/AuthContext";
import Layout from "../Layout/Layout";
import Hero from "../Pages/Hero";
import Signup from "../Pages/Signup";
import Login from "../Pages/Login";
import InterviewForm from "../Pages/InterviewForm";
import { InterviewContextProvider } from "../Context/InterviewContext";
import ProtectedRoute from "./ProtectedRoutes";
import { ChatBotContextProvider } from "../Context/ChatBotContext";
import ChatBot from "../Pages/ChatBot";
import InterviewQuestions from "../Pages/InterviewQuestions";
import NotFound from "../Components/NotFound";
import About from "../Pages/About";
import ContactUs from "../Pages/ContactUs";
import Landing from "../Pages/Landing";
import Loader from "../Components/Loader";

const AppLayout = () => (
  <Layout>
    <Outlet />
  </Layout>
);

function HomeRoute() {
  const { User, fetchedUser } = useAuth();
  if (!fetchedUser) return <div className="text-white text-center py-20">Loading...</div>;
  return <Landing />;
}

function ProtectedHome() {
  const { User, fetchedUser } = useAuth();
  if (!fetchedUser) return <div className="text-white text-center py-20">Loading...</div>;
  return User ? <Hero /> : <Landing />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      {
        path: "home",
        element: <ProtectedHome />,
      },
      {
        path: "app",
        element: (
          <ProtectedRoute>
            <ChatBotContextProvider>
              <ChatBot />
            </ChatBotContextProvider>
          </ProtectedRoute>
        ),
      },
      {
        path: "interview-form",
        element: (
          <ProtectedRoute>
            <InterviewContextProvider>
              <InterviewForm />
            </InterviewContextProvider>
          </ProtectedRoute>
        ),
      },
      {
        path: "interview",
        element: (
          <ProtectedRoute>
            <InterviewContextProvider>
              <InterviewQuestions />
            </InterviewContextProvider>
          </ProtectedRoute>
        ),
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <ContactUs />,
      },
    ],
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const Routes = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default Routes;
