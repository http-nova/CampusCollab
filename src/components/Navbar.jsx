import React from 'react';
import { User, Award, ShieldCheck, Layers, LayoutDashboard, MessageSquare, Trophy, FolderPlus, LogOut } from 'lucide-react';
import './Navbar.css';

const formatShortName = (name) => {
  if (!name) return 'User';
  const trimmed = name.trim();
  const baseName = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
  const parts = baseName.split(/\s+/);
  if (parts.length > 1) {
    const shortForm = `${parts[0]} ${parts[1][0]}.`;
    if (shortForm.length <= 13) return shortForm;
    return parts[0].length <= 12 ? parts[0] : `${parts[0].substring(0, 10)}…`;
  }
  if (baseName.length > 12) {
    return `${baseName.substring(0, 10)}…`;
  }
  return baseName;
};

export const Navbar = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  userPoints,
  onOpenSubmitModal,
  currentUser,
  onOpenAuthModal,
  onLogout
}) => {
  const isFaculty = userRole === 'Faculty';
  const isSignedIn = Boolean(currentUser);

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('home')}
          className="navbar-brand"
        >
          <span className="font-serif navbar-logo-text">
            CampusCollab
          </span>
        </div>

        {/* Center Nav Links: When NOT signed in, show ONLY 'Home' */}
        <nav className="navbar-nav-links">
          <button
            onClick={() => setActiveTab('home')}
            className={`navbar-link-btn ${activeTab === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          
          {/* Authenticated Links: Only shown when signed in */}
          {isSignedIn && (
            <>
              <button
                onClick={() => setActiveTab('projects')}
                className={`navbar-link-btn ${activeTab === 'projects' ? 'active' : ''}`}
              >
                <Layers size={16} />
                Projects
              </button>

              {!isFaculty && (
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`navbar-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                >
                  <LayoutDashboard size={16} />
                  Workspace
                </button>
              )}

              {/* FACULTY PORTAL LINK - Visible ONLY to Faculty */}
              {isFaculty && (
                <button
                  onClick={() => setActiveTab('faculty')}
                  className={`navbar-link-btn ${activeTab === 'faculty' ? 'active' : ''}`}
                >
                  <ShieldCheck size={16} />
                  Faculty Portal
                </button>
              )}

              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`navbar-link-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
              >
                <Trophy size={16} />
                Leaderboard
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`navbar-link-btn ${activeTab === 'chat' ? 'active' : ''}`}
              >
                <MessageSquare size={16} />
                Chat
              </button>
            </>
          )}
        </nav>

        {/* Right Actions: When not signed in -> show Student / Faculty preview switcher and Sign In */}
        <div className="navbar-actions">
          {!isSignedIn ? (
            <>
              <div className="role-switcher-group">
                <button
                  onClick={() => setUserRole('Student')}
                  className={`role-switch-btn ${userRole === 'Student' ? 'active-student' : ''}`}
                  title="Select Student Role"
                >
                  Student
                </button>
                <button
                  onClick={() => setUserRole('Faculty')}
                  className={`role-switch-btn ${userRole === 'Faculty' ? 'active-faculty' : ''}`}
                  title="Select Faculty Role"
                >
                  Faculty
                </button>
              </div>

              <button onClick={onOpenAuthModal} className="btn-outline-pill">
                <User size={16} />
                <span>Sign In</span>
              </button>
            </>
          ) : (
            <>
              {/* Points Pill (Students only) */}
              {!isFaculty && (
                <div 
                  onClick={() => setActiveTab('leaderboard')}
                  title="Click to view Leaderboard & Points"
                  className="navbar-points-pill"
                >
                  <Award size={16} />
                  <span>{userPoints} pts</span>
                </div>
              )}

              {/* Submit Idea CTA (Students) */}
              {onOpenSubmitModal && !isFaculty && (
                <button
                  onClick={onOpenSubmitModal}
                  className="btn-primary submit-idea-nav-btn"
                >
                  <FolderPlus size={16} />
                  Submit Idea
                </button>
              )}

              {/* Profile Pill with Sign Out */}
              <div className="navbar-profile-group">
                <div className="btn-outline-pill navbar-user-pill" title={currentUser.displayName || currentUser.email}>
                  <User size={16} />
                  <span className="navbar-user-name">
                    {formatShortName(currentUser.displayName || currentUser.email)}
                  </span>
                </div>
                <button onClick={onLogout} className="logout-nav-btn" title="Sign Out">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
