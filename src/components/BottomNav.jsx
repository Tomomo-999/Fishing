import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/',          icon: '🏠', label: 'ホーム' },
  { to: '/fish',      icon: '🐟', label: '魚図鑑' },
  { to: '/spots',     icon: '📍', label: '釣り場' },
  { to: '/plan',      icon: '📅', label: '計画' },
  { to: '/catchlog',  icon: '🎣', label: '釣果' },
  { to: '/myspots',   icon: '⭐', label: 'マイ' },
];

const BottomNav = () => (
  <nav style={{
    position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
    width: '100%', maxWidth: '430px',
    background: 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderTop: '1px solid rgba(46,134,193,.12)',
    boxShadow: '0 -4px 20px rgba(12,45,72,.08)',
    display: 'flex', zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom)',
  }}>
    {NAV_ITEMS.map(item => (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === '/'}
        style={({ isActive }) => ({
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '8px 4px 6px', gap: '3px',
          color: isActive ? '#2E86C1' : '#AAB7B8',
          fontSize: '10px', fontWeight: isActive ? 700 : 500,
          textDecoration: 'none', position: 'relative',
          minHeight: '52px',
        })}
      >
        {({ isActive }) => (
          <>
            <div style={{
              width: '40px', height: '30px',
              borderRadius: '10px',
              background: isActive ? 'rgba(46,134,193,.12)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s',
            }}>
              <span style={{ fontSize: '20px', lineHeight: 1 }}>{item.icon}</span>
            </div>
            <span style={{ fontSize: '10px' }}>{item.label}</span>
          </>
        )}
      </NavLink>
    ))}
  </nav>
);

export default BottomNav;
