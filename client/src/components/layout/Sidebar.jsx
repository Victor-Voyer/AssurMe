import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Bell,
  MessageSquare,
  Shield,
} from 'lucide-react';

const links = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/contracts', label: 'Contrats', icon: FileText },
  { to: '/alerts', label: 'Alertes', icon: Bell },
  { to: '/claim', label: 'Sinistre', icon: MessageSquare },
];

export default function Sidebar() {
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-white">
      <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-5">
        <Shield className="h-7 w-7 text-blue-400" />
        <span className="text-lg font-bold tracking-tight">AssurMe</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
