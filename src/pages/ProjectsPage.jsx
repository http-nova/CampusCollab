import React, { useState, useMemo } from 'react';
import { Search, Award, ArrowRight, FolderPlus, Clock, Users, ShieldCheck, Rocket, Tag, Lock } from 'lucide-react';
import './ProjectsPage.css';

const getProjectCoverImage = (p) => {
  if (p?.coverImage) return p.coverImage;
  const title = (p?.title || '').toLowerCase();
  const dept = (p?.department || '').toLowerCase();
  if (title.includes('ai') || title.includes('health') || dept.includes('biomedical')) {
    return '/hero_students_green.jpg';
  } else if (title.includes('drone') || title.includes('robot') || dept.includes('mechanical') || dept.includes('electrical')) {
    return '/team_photo_green.jpg';
  } else {
    return '/hero_students_green.jpg';
  }
};

export const ProjectsPage = ({
  projects = [],
  departments = [],
  onSelectProject,
  onOpenSubmitModal,
  onOpenHostModal,
  currentUser,
  onOpenAuthModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('All');
  const [sortBy, setSortBy] = useState('recent');

  const availableRoleFilters = [
    'All',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Database Engineer',
    'UI/UX Designer',
    'AI / ML Specialist',
    'Mobile App Developer'
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.facultyMentor && p.facultyMentor.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.requiredSkills && p.requiredSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (p.openRoles && p.openRoles.some(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesDept = selectedDept === 'All' || p.department === selectedDept;

      const matchesRole = selectedRoleFilter === 'All' || 
        (p.openRoles && p.openRoles.some(r => r.name.toLowerCase() === selectedRoleFilter.toLowerCase()));

      return matchesSearch && matchesDept && matchesRole;
    }).sort((a, b) => {
      if (sortBy === 'points') return (b.pointsReward || 0) - (a.pointsReward || 0);
      if (sortBy === 'deadline') return (a.daysRemaining || 99) - (b.daysRemaining || 99);
      return 0; // recent
    });
  }, [projects, searchQuery, selectedDept, selectedRoleFilter, sortBy]);

  const handleCardClick = (project) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      else if (onSelectProject) onSelectProject(project);
    } else {
      if (onSelectProject) onSelectProject(project);
    }
  };

  return (
    <div className="container projects-page-container animate-fade-in">
      {/* Header Banner */}
      <div className="projects-header-banner">
        <div>
          <div className="projects-banner-tag">
            <ShieldCheck size={16} /> Verified Academic Collaboration Board
          </div>
          <h1 className="font-serif projects-banner-title">
            Browse Academic Projects & Hosted Teams
          </h1>
          <p className="projects-banner-desc">
            {currentUser
              ? 'Explore faculty-approved projects and student-hosted teams. Apply for specific roles and earn role-based reward points.'
              : 'Explore innovative campus project proposals. Sign in to view team roles, requirements, mentor evaluations, and apply.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {currentUser && onOpenHostModal && (
            <button
              onClick={onOpenHostModal}
              className="btn-primary"
              style={{ padding: '12px 20px', fontSize: '13px', backgroundColor: '#1D2E19', border: '1px solid var(--accent-green)' }}
            >
              <Rocket size={16} color="var(--accent-green)" /> Host Your Project
            </button>
          )}
          <button
            onClick={() => {
              if (!currentUser && onOpenAuthModal) onOpenAuthModal();
              else onOpenSubmitModal();
            }}
            className="btn-primary"
            style={{ padding: '12px 20px', fontSize: '13px' }}
          >
            <FolderPlus size={16} /> Submit Proposal
          </button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="projects-controls-card">
        <div className="projects-search-sort-row">
          <div className="projects-search-wrapper">
            <Search size={18} className="projects-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, role (Frontend, Backend, Design), or skills..."
              className="projects-search-input"
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Filter Role:</span>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="projects-sort-select"
                >
                  {availableRoleFilters.map(rf => (
                    <option key={rf} value={rf}>{rf}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="projects-sort-select"
              >
                <option value="recent">Most Recent</option>
                {currentUser && <option value="points">Highest Reward Points</option>}
                <option value="deadline">Ending Soonest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Department Filter Chips */}
        <div className="projects-dept-chips-row">
          <button
            onClick={() => setSelectedDept('All')}
            className={`projects-dept-chip ${selectedDept === 'All' ? 'active' : ''}`}
          >
            All Departments ({projects.length})
          </button>
          {departments.map(d => (
            <button
              key={d.id}
              onClick={() => setSelectedDept(d.name)}
              className={`projects-dept-chip ${selectedDept === d.name ? 'active' : ''}`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Catalog Grid */}
      {filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', backgroundColor: '#FFFFFF', borderRadius: '24px', border: '1px solid #E5E7EB' }}>
          <FolderPlus size={48} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No matching projects found</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Try adjusting your search query, department filter, or host your own project.
          </p>
        </div>
      ) : (
        <div className="projects-catalog-grid">
          {filteredProjects.map(p => (
            <div
              key={p.id}
              onClick={() => handleCardClick(p)}
              className={`project-catalog-card ${!currentUser ? 'unauthenticated-card' : ''}`}
            >
              {/* WITHOUT SIGN-IN: Show ONLY Name, Image, and Description */}
              {!currentUser ? (
                <div className="project-preview-unauth-layout">
                  <div className="project-cover-image-container">
                    <img
                      src={getProjectCoverImage(p)}
                      alt={p.title}
                      className="project-cover-img"
                    />
                  </div>

                  <h3 className="project-card-title" style={{ marginTop: '16px', marginBottom: '8px' }}>
                    {p.title}
                  </h3>

                  <p className="project-card-abstract" style={{ marginBottom: '12px' }}>
                    {p.description}
                  </p>

                  <div className="project-unauth-lock-hint">
                    <Lock size={13} color="var(--accent-green)" />
                    <span>Sign in to view details & apply</span>
                  </div>
                </div>
              ) : (
                /* SIGNED IN: Show Full Project Details */
                <>
                  <div>
                    <div className="project-card-header-row">
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span className="badge badge-green">{p.department}</span>
                        {p.isRecruiting && (
                          <span style={{
                            backgroundColor: '#12210F',
                            color: 'var(--accent-green)',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Rocket size={11} /> Recruiting Team
                          </span>
                        )}
                      </div>
                      <span className="project-card-reward">
                        <Award size={16} /> +{p.pointsReward || 150} pts
                      </span>
                    </div>

                    <h3 className="project-card-title">{p.title}</h3>
                    
                    {p.recruitmentHeadline && (
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '8px' }}>
                        📢 {p.recruitmentHeadline}
                      </div>
                    )}

                    <p className="project-card-abstract">{p.description}</p>

                    {/* Open Roles & Role Points Breakdown */}
                    {p.openRoles && p.openRoles.length > 0 && (
                      <div style={{ marginBottom: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase' }}>
                          Open Roles & Point Allocation:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {p.openRoles.map(role => (
                            <span key={role.id || role.name} style={{
                              backgroundColor: '#E7F3DC',
                              color: '#2D6A1E',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {role.name}: +{role.points} pts
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Skill Tags */}
                    {p.requiredSkills && (
                      <div className="project-card-skills-row">
                        {p.requiredSkills.map(s => (
                          <span key={s} className="project-skill-tag">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} /> {p.teamMembers?.length || 1} / {p.maxTeamSize || 4} Members
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} /> {p.daysRemaining || 45}d left
                      </span>
                    </div>

                    <div className="project-card-footer-meta">
                      <div className="project-card-mentor">
                        Mentor: <strong>{p.facultyMentor || 'Faculty Mentor'}</strong>
                      </div>
                      <div className="project-card-apply-action">
                        Apply for Role <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
