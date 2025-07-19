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
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";

// Import components
import Landing from "./Pages/Landing";
import Dashboard from "./Pages/Dashboard";
import Repositories from "./Pages/Repositories";
import Navbar from "./Components/Navbar";
import Reports from "./Pages/reports";
import ScanResult from "./Pages/ScanResult";
import PastScans from "./Pages/PastScans";

function App() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        setLoading(false);
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
      setLoading(false);
    };

    checkSession();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <PersistGate loading={null} persistor={persistor}>
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
            element={user ? <ScanResult /> : <Navigate to="/" />}
          />
          <Route
            path="/past-scans/:githubId"
            element={user ? <PastScans /> : <Navigate to="/" />}
          />
          <Route
            path="/reports"
            element={user ? <Reports /> : <Navigate to="/" />}
          />
        </Routes>
      </Router>
    </PersistGate>
  );
}

export default App;
