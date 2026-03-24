import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban } from 'lucide-react';

export default function Sidebar({ userRole }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h2>Gestor Prácticas</h2>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? 'active' : ''}`
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {['admin', 'usuario'].includes(userRole) && (
          <NavLink
            to="/students"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Users size={18} />
            <span>Alumnos</span>
          </NavLink>
        )}

        {userRole === 'admin' && (
          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FolderKanban size={18} />
            <span>Grupos</span>
          </NavLink>
        )}
      </nav>
    </aside>
  );
}