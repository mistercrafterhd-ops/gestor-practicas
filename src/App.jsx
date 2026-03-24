import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';
import { AppProvider } from './context/AppContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Sidebar from './components/layout/Sidebar';
import StudentsList from './pages/StudentsList';
import GroupsPage from './pages/GroupsPage';
import GroupView from './pages/GroupView';

function AppShell({ session, userProfile }) {
  const displayName =
    userProfile?.nombre ||
    session?.user?.user_metadata?.nombre ||
    session?.user?.email?.split('@')[0] ||
    'Usuario';

  const rawRole = userProfile?.rol;
  const userRole =
    typeof rawRole === 'string' && rawRole.trim() !== ''
      ? rawRole.trim().toLowerCase()
      : 'usuario';

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AppProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Sidebar userRole={userRole} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <header
            style={{
              height: '72px',
              background: 'var(--bg-secondary)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Rol: {userRole}
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleLogout}>
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </header>

          <main style={{ flex: 1, overflowY: 'auto' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route
                path="/dashboard"
                element={<Dashboard session={session} userProfile={userProfile} />}
              />

              <Route
                path="/students"
                element={
                  ['admin', 'usuario'].includes(userRole) ? (
                    <StudentsList userRole={userRole} />
                  ) : (
                    <Navigate to="/dashboard" replace />
                  )
                }
              />

              <Route
                path="/groups"
                element={
                  userRole === 'admin' ? <GroupsPage /> : <Navigate to="/dashboard" replace />
                }
              />

              <Route
                path="/groups/:id"
                element={
                  userRole === 'admin' ? <GroupView /> : <Navigate to="/dashboard" replace />
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </AppProvider>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error cargando perfil:', error);
      setUserProfile(null);
      return;
    }

    console.log('Perfil cargado:', data);
    setUserProfile(data ?? null);
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        setLoading(true);

        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error obteniendo sesión:', error);
          if (isMounted) {
            setSession(null);
            setUserProfile(null);
          }
          return;
        }

        if (!isMounted) return;

        setSession(currentSession);

        if (currentSession?.user) {
          await loadProfile(currentSession.user);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error inicializando sesión:', error);
        if (isMounted) {
          setSession(null);
          setUserProfile(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);

      if (newSession?.user) {
        await loadProfile(newSession.user);
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Cargando...</div>;
  }

  if (!session) {
    return <AuthPage />;
  }

  return <AppShell session={session} userProfile={userProfile} />;
}