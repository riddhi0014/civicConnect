import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function Unauthorized() {
  const { role, user } = useAuth();

  const getHomePath = () => {
    if (!user) return '/login';
    if (role === 'officer') return '/officer';
    if (role === 'admin') return '/admin';
    return '/citizen';
  };

  return (
    <div style={{
      maxWidth: '480px',
      margin: '60px auto',
      textAlign: 'center',
      padding: '0 16px'
    }}>
      <div className="card animate-fade-in" style={{ padding: '40px 24px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: '#fff1f2',
          color: '#e11d48',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <ShieldX size={28} />
        </div>

        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          403: Access Restricted
        </h1>

        <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px' }}>
          You do not have the required role credentials to view this area.
          {role ? ` (Your current role is: ${role})` : ''}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <Link to={getHomePath()} className="btn btn-primary">
            <ArrowLeft size={16} />
            Back to Safe Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
