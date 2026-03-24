import { LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function Header({ displayName, userRole }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="topbar">
      <div className="topbar-user">
        <div className="topbar-name">{displayName}</div>
        <div className="topbar-role">Rol: {userRole}</div>
      </div>

      <button className="btn btn-primary" onClick={handleLogout}>
        <LogOut size={16} />
        Cerrar sesión
      </button>
    </header>
  );
}