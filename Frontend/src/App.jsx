import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
  const fetchToken = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (session) {
      console.log("🔑 Supabase JWT Token:", session.access_token);
    } else {
      console.log("❌ No session found");
    }
  };

  fetchToken();
  const callSecureRoute = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch('http://localhost:5000/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  console.log('🔒 Backend Response:', data);
};
callSecureRoute
}, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Realtime auth change listener
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  

  return (
    <div style={{ padding: 30 }}>
      <h1>🛡️ HawkEye Auth</h1>
      {user ? (
        <>
          <p>✅ Logged in as: {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login with GitHub</button>
      )}
    </div>
  );
}

export default App;
