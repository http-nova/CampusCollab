import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Users, Trash2, Key, CheckCircle, AlertCircle, ArrowLeft, Lock, RefreshCw, Mail, Eye, EyeOff, Edit3, Save } from 'lucide-react';
import { subscribeToFacultyList, createFacultyAccount, deleteFacultyAccount, updateFacultyAccount } from '../services/firebaseService';
import './AdminPanelPage.css';

const DEFAULT_ADMIN_ID = 'admin@campuscollab.edu';
const DEFAULT_ADMIN_PASS = 'CampusAdmin@2026!';

export const AdminPanelPage = ({
  onExitAdmin,
  departments = [],
  projects = [],
  submissions = [],
  leaderboard = []
}) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('campuscollab_admin_auth') === 'true';
  });

  // Login Gate State
  const [adminInputId, setAdminInputId] = useState('');
  const [adminInputPass, setAdminInputPass] = useState('');
  const [adminLoginError, setAdminLoginError] = useState('');

  // Generated / Configured Admin Credentials
  const [adminCredentials, setAdminCredentials] = useState(() => {
    const saved = localStorage.getItem('campuscollab_admin_creds');
    return saved ? JSON.parse(saved) : { id: DEFAULT_ADMIN_ID, pass: DEFAULT_ADMIN_PASS };
  });

  // Faculty Directory State
  const [facultyList, setFacultyList] = useState([]);
  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyDept, setNewFacultyDept] = useState('Computer Science & AI');
  const [newFacultyTitle, setNewFacultyTitle] = useState('Assistant Professor');
  const [newFacultyPass, setNewFacultyPass] = useState('Faculty@2026');
  const [newFacultyShowOnHome, setNewFacultyShowOnHome] = useState(true);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Editing Faculty State
  const [editingFaculty, setEditingFaculty] = useState(null);

  useEffect(() => {
    const unsub = subscribeToFacultyList((list) => {
      setFacultyList(list);
    });
    return () => unsub();
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminInputId.trim().toLowerCase() === adminCredentials.id.toLowerCase() && adminInputPass === adminCredentials.pass) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('campuscollab_admin_auth', 'true');
      setAdminLoginError('');
    } else {
      setAdminLoginError('Invalid Admin ID or Password. Check credentials callout below.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('campuscollab_admin_auth');
  };

  const generateRandomAdminPass = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let newPass = '';
    for (let i = 0; i < 12; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const updated = { ...adminCredentials, pass: newPass };
    setAdminCredentials(updated);
    localStorage.setItem('campuscollab_admin_creds', JSON.stringify(updated));
    setActionSuccessMsg(`New random Admin password generated: ${newPass}`);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    if (!newFacultyName || !newFacultyEmail) return;

    await createFacultyAccount({
      name: newFacultyName,
      email: newFacultyEmail,
      department: newFacultyDept,
      title: newFacultyTitle,
      password: newFacultyPass,
      showOnHome: newFacultyShowOnHome
    });

    setActionSuccessMsg(`Faculty mentor account created for ${newFacultyName} (${newFacultyEmail})!`);
    setNewFacultyName('');
    setNewFacultyEmail('');
    setNewFacultyPass('Faculty@2026');
    setNewFacultyShowOnHome(true);
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleToggleHomeDisplay = async (faculty) => {
    const newStatus = !(faculty.showOnHome !== false);
    await updateFacultyAccount(faculty.id, { showOnHome: newStatus });
    setActionSuccessMsg(`${faculty.name || faculty.displayName} is now ${newStatus ? 'VISIBLE on' : 'HIDDEN from'} the Home Page team section.`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleSaveEditedFaculty = async (e) => {
    e.preventDefault();
    if (!editingFaculty) return;

    await updateFacultyAccount(editingFaculty.id, {
      name: editingFaculty.name,
      displayName: editingFaculty.name,
      department: editingFaculty.department,
      title: editingFaculty.title,
      showOnHome: editingFaculty.showOnHome
    });

    setActionSuccessMsg(`Updated faculty details for ${editingFaculty.name}!`);
    setEditingFaculty(null);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleDeleteFaculty = async (facultyId, facultyName) => {
    if (window.confirm(`Are you sure you want to remove faculty account: ${facultyName}?`)) {
      await deleteFacultyAccount(facultyId);
      setActionSuccessMsg(`Removed faculty mentor: ${facultyName}`);
      setTimeout(() => setActionSuccessMsg(''), 3000);
    }
  };

  // 1. ADMIN LOGIN GATE (If not authenticated)
  if (!isAdminAuthenticated) {
    return (
      <div className="container admin-page-container animate-fade-in">
        <div className="admin-login-card">
          <div className="admin-login-icon-box">
            <Lock size={28} />
          </div>

          <h2 className="font-serif" style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '6px' }}>
            CampusCollab Admin Portal
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '24px' }}>
            Confidential University Administration Console
          </p>

          <div className="admin-creds-callout">
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              🔑 System Admin Credentials:
            </div>
            <div className="admin-creds-row">
              <span>Admin ID:</span>
              <span>{adminCredentials.id}</span>
            </div>
            <div className="admin-creds-row">
              <span>Password:</span>
              <span>{adminCredentials.pass}</span>
            </div>
          </div>

          {adminLoginError && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="auth-input-label">Admin ID / Email</label>
              <input
                type="text"
                required
                value={adminInputId}
                onChange={(e) => setAdminInputId(e.target.value)}
                placeholder="admin@campuscollab.edu"
                className="auth-input-field"
              />
            </div>

            <div>
              <label className="auth-input-label">Admin Password</label>
              <input
                type="password"
                required
                value={adminInputPass}
                onChange={(e) => setAdminInputPass(e.target.value)}
                placeholder="••••••••"
                className="auth-input-field"
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
              <ShieldCheck size={16} /> Authenticate Admin Console
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onExitAdmin}
              className="btn-outline"
              style={{ fontSize: '12px', padding: '6px 16px' }}
            >
              <ArrowLeft size={14} /> Return to Public Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED ADMIN DASHBOARD
  const activeProjectsCount = projects.length;
  const activeStudentsCount = Math.max(1, leaderboard.length);
  const activeMentorsCount = facultyList.length;

  return (
    <div className="container admin-page-container animate-fade-in">
      {/* Top Bar with Navigation & Actions */}
      <div className="admin-header-row">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
            <ShieldCheck size={16} /> Confidential Access Route
          </div>
          <h1 className="font-serif admin-portal-title">University Administration Panel</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Manage faculty mentors, customize public display visibility, and monitor real-time platform metrics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={generateRandomAdminPass} className="btn-outline" style={{ fontSize: '12px', padding: '8px 14px' }}>
            <RefreshCw size={14} /> Randomize Admin Pass
          </button>
          <button onClick={handleAdminLogout} className="btn-outline" style={{ fontSize: '12px', padding: '8px 14px', color: '#DC2626', borderColor: '#FCA5A5' }}>
            Sign Out Admin
          </button>
          <button onClick={onExitAdmin} className="btn-primary" style={{ fontSize: '12px', padding: '8px 16px' }}>
            <ArrowLeft size={14} /> Exit to App
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div style={{ backgroundColor: '#E7F3DC', color: '#2D6A1E', padding: '14px 20px', borderRadius: '12px', fontWeight: 600, fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #C0D6B4' }}>
          <CheckCircle size={18} color="var(--accent-green)" /> {actionSuccessMsg}
        </div>
      )}

      {/* Real-time Counts Summary */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-num">{activeProjectsCount}</div>
          <div className="admin-stat-label">Active Approved Projects</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{activeStudentsCount}</div>
          <div className="admin-stat-label">Registered Students</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-num">{activeMentorsCount}</div>
          <div className="admin-stat-label">Authorized Faculty Mentors</div>
        </div>
      </div>

      {/* Main Admin Section: 2 Columns */}
      <div className="admin-content-grid">
        {/* ADD NEW FACULTY FORM */}
        <div className="admin-card-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <UserPlus size={20} color="var(--accent-green)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Provision Faculty Mentor Account</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.5 }}>
            Faculty accounts cannot self-register. Authorize professors and coordinators below with university credentials.
          </p>

          <form onSubmit={handleAddFaculty} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="admin-form-group">
              <label className="auth-input-label">Faculty Full Name *</label>
              <input
                type="text"
                required
                value={newFacultyName}
                onChange={(e) => setNewFacultyName(e.target.value)}
                placeholder="e.g. Dr. Maya Lin"
                className="auth-input-field"
              />
            </div>

            <div className="admin-form-group">
              <label className="auth-input-label">Official University Email *</label>
              <input
                type="email"
                required
                value={newFacultyEmail}
                onChange={(e) => setNewFacultyEmail(e.target.value)}
                placeholder="e.g. dr.lin@university.edu"
                className="auth-input-field"
              />
            </div>

            <div className="admin-form-group">
              <label className="auth-input-label">Academic Department</label>
              <select
                value={newFacultyDept}
                onChange={(e) => setNewFacultyDept(e.target.value)}
                className="auth-input-field"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="auth-input-label">Designation / Title</label>
              <input
                type="text"
                value={newFacultyTitle}
                onChange={(e) => setNewFacultyTitle(e.target.value)}
                placeholder="e.g. Associate Professor & Lab Lead"
                className="auth-input-field"
              />
            </div>

            <div className="admin-form-group">
              <label className="auth-input-label">Initial Access Password</label>
              <input
                type="text"
                required
                value={newFacultyPass}
                onChange={(e) => setNewFacultyPass(e.target.value)}
                className="auth-input-field"
                style={{ fontFamily: 'monospace' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
              <input
                type="checkbox"
                id="showOnHomeCheckbox"
                checked={newFacultyShowOnHome}
                onChange={(e) => setNewFacultyShowOnHome(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
              />
              <label htmlFor="showOnHomeCheckbox" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>
                Display mentor in "Meet Our Mentors" on Home Page
              </label>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }}>
              <UserPlus size={16} /> Provision Faculty Account
            </button>
          </form>
        </div>

        {/* REGISTERED FACULTY MENTORS DIRECTORY */}
        <div className="admin-card-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--accent-green)" />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Authorized Faculty Directory ({facultyList.length})</h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Official University Staff
            </span>
          </div>

          {facultyList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
              No faculty mentors registered yet. Add faculty on the left.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Faculty Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Home Display</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.map(f => {
                    const isVisible = f.showOnHome !== false;
                    return (
                      <tr key={f.id || f.email}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#12210F', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                              {f.name ? f.name.substring(0, 2).toUpperCase() : 'FC'}
                            </div>
                            <div>
                              <strong>{f.name || f.displayName}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{f.title || 'Faculty Mentor'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                            <Mail size={12} /> {f.email}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-green" style={{ fontSize: '11px' }}>{f.department || 'Computer Science'}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleHomeDisplay(f)}
                            className={`btn-outline ${isVisible ? 'active-home-display' : ''}`}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              backgroundColor: isVisible ? '#E7F3DC' : '#F3F4F6',
                              color: isVisible ? '#2D6A1E' : '#6B7280',
                              borderColor: isVisible ? '#A7D790' : '#D1D5DB'
                            }}
                            title="Click to toggle visibility on Home page"
                          >
                            {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                            {isVisible ? 'Visible' : 'Hidden'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setEditingFaculty(f)}
                              className="btn-outline"
                              style={{ padding: '4px 8px', fontSize: '11px' }}
                              title="Edit faculty profile"
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFaculty(f.id, f.name || f.displayName)}
                              className="admin-delete-btn"
                              title="Revoke access"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* EDIT FACULTY MODAL */}
      {editingFaculty && (
        <div className="doc-viewer-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setEditingFaculty(null); }}>
          <div className="doc-viewer-modal-card animate-fade-in" style={{ width: '500px' }}>
            <button onClick={() => setEditingFaculty(null)} className="auth-modal-close">✕</button>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Edit Faculty Profile</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Update faculty information and home page visibility settings.
            </p>

            <form onSubmit={handleSaveEditedFaculty} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="auth-input-label">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingFaculty.name}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, name: e.target.value })}
                  className="auth-input-field"
                />
              </div>

              <div>
                <label className="auth-input-label">Department</label>
                <select
                  value={editingFaculty.department}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, department: e.target.value })}
                  className="auth-input-field"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="auth-input-label">Title / Designation</label>
                <input
                  type="text"
                  value={editingFaculty.title || ''}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, title: e.target.value })}
                  className="auth-input-field"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0' }}>
                <input
                  type="checkbox"
                  id="editShowOnHome"
                  checked={editingFaculty.showOnHome !== false}
                  onChange={(e) => setEditingFaculty({ ...editingFaculty, showOnHome: e.target.checked })}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--accent-green)', cursor: 'pointer' }}
                />
                <label htmlFor="editShowOnHome" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Show on Home page ("Meet Our Mentors")
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setEditingFaculty(null)} className="btn-outline">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
