// App.js
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { setUser, clearUser } from "./store/userSlice";
import { supabase } from "./supabaseClient";
import Landing from "./Pages/Landing";
import Dashboard from "./Pages/Dashboard";
import Repositories from "./Pages/Repositories";
import Navbar from "./Components/Navbar";
import ScanResults from "./Pages/ScanResult";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    // Check for existing session on app load
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        return;
      }

      if (session) {
        dispatch(
          setUser({
            user: session.user,
            githubToken: session.provider_token,
          })
        );
      }
    };

    checkSession();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        dispatch(
          setUser({
            user: session.user,
            githubToken: session.provider_token,
          })
        );
      } else {
        dispatch(clearUser());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <>
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/dashboard" /> : <Landing />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/repositories"
            element={user ? <Repositories /> : <Navigate to="/" />}
          />
          <Route
            path="/scan-results/:scanId"
            element={user ? <ScanResults /> : <Navigate to="/" />}
          />
          {/* Add more protected routes as needed */}
        </Routes>
      </Router>
    </>
  );
}

export default App;
