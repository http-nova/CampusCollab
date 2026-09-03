import React from 'react';
import { ArrowRight, Check, Send, ShieldCheck, Users, Award, Sparkles, Lock } from 'lucide-react';
import './HomePage.css';

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

export const HomePage = ({
  projects = [],
  submissions = [],
  facultyList = [],
  leaderboard = [],
  onSelectProject,
  onViewAllProjects,
  currentUser,
  onOpenAuthModal
}) => {
  const services = [
    {
      id: 's1',
      title: 'Project Submission',
      icon: <Send size={20} color="#FFFFFF" />,
      description: 'Students present project ideas, research papers, and slides for faculty mentorship evaluation.',
      linkText: 'Submit Proposal'
    },
    {
      id: 's2',
      title: 'Faculty Approval',
      icon: <ShieldCheck size={20} color="#FFFFFF" />,
      description: 'Professors verify technical quality and approve academic concepts before public board listing.',
      linkText: 'Faculty Review'
    },
    {
      id: 's3',
      title: 'Team Collaboration',
      icon: <Users size={20} color="#FFFFFF" />,
      description: 'Students browse approved projects and apply to join cross-functional teams based on skill sets.',
      linkText: 'Join a Team'
    },
    {
      id: 's4',
      title: 'Points & Rewards',
      icon: <Award size={20} color="#FFFFFF" />,
      description: 'Earn platform points for submissions, milestone completions, and peer teamwork.',
      linkText: 'View Leaderboard'
    }
  ];

  const checklist = [
    'Faculty-Verified Projects',
    'Real-Time Team Chat',
    'Transparent Points Tracking',
    'Deadline Reminders'
  ];

  // REAL-TIME STATS COUNTS
  const totalProjectsCount = projects.length;
  const totalStudentsCount = Math.max(1, leaderboard?.length || 0);
  const totalMentorsCount = Math.max(1, facultyList?.length || 0);

  // Filter ONLY mentors who have showOnHome !== false (selected in Admin Panel)
  const displayMentors = facultyList
    .filter(f => f.showOnHome !== false)
    .map(f => ({
      id: f.id,
      name: f.name || f.displayName,
      role: `${f.title || 'Faculty Mentor'} • ${f.department || 'Academic Department'}`,
      avatar: (f.name || f.displayName || 'FM').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      bg: f.avatarBg || '#12210F'
    }));

  const handleCardClick = (project) => {
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      else if (onSelectProject) onSelectProject(project);
    } else {
      if (onSelectProject) onSelectProject(project);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* 1. HERO SECTION */}
      <section className="home-hero-section">
        <div className="container">
          <div className="home-hero-grid">
            <div>
              <div className="home-hero-tag">
                <Sparkles size={16} /> Academic Project Collaboration
              </div>

              <h1 className="font-serif home-hero-headline">
                Empowering Student Collaboration for Every Project
              </h1>

              <p className="home-hero-subtitle">
                Submit project ideas, receive faculty approval, and build high-performing teams across your campus. Earn points for milestone completion.
              </p>

              <div>
                <button
                  onClick={onViewAllProjects}
                  className="btn-primary home-hero-cta-btn"
                >
                  Get Started <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="home-hero-image-wrapper">
              <div className="home-hero-shape-backdrop" />

              <div className="home-hero-card-frame">
                <img
                  src="/hero_students_green.jpg"
                  alt="Students Collaborating"
                  className="home-hero-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. "OUR SERVICES" BLOCK */}
      <section className="home-services-section">
        <div className="container">
          <div className="home-services-container">
            <div className="home-services-header">
              <h2 className="font-serif home-services-title">
                What CampusCollab Offers
              </h2>
              <p className="home-services-subtitle">
                A complete academic workflow supporting project submission, professor verification, recruitment, and reward tracking.
              </p>
            </div>

            <div className="home-services-grid">
              {services.map(s => (
                <div
                  key={s.id}
                  className="service-card-dark"
                  onClick={onViewAllProjects}
                  style={{ cursor: 'pointer' }}
                >
                  <div>
                    <div className="home-service-icon-badge">
                      {s.icon}
                    </div>

                    <h3 className="home-service-card-title">
                      {s.title}
                    </h3>

                    <p className="home-service-card-desc">
                      {s.description}
                    </p>
                  </div>

                  <div className="home-service-card-link">
                    {s.linkText} <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. "WHY CAMPUSCOLLAB" SECTION */}
      <section className="home-why-section">
        <div className="container">
          <div className="home-why-grid">
            <div>
              <div className="home-why-image-frame">
                <img
                  src="/team_photo_green.jpg"
                  alt="Campus Research Workspace"
                  className="home-why-img"
                />
              </div>
            </div>

            <div>
              <h2 className="font-serif home-why-title">
                Why CampusCollab
              </h2>
              <p className="home-why-desc">
                We bridge the gap between academic theory and real-world collaboration. Our platform guarantees verified mentor guidance, structured progress milestones, and transparent team credit.
              </p>

              <div className="home-checklist-grid">
                {checklist.map(item => (
                  <div key={item} className="home-checklist-item">
                    <div className="home-check-icon">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span className="home-check-label">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. REAL-TIME FACULTY MENTORS & LIVE STATS SECTION */}
      <section className="home-team-section">
        <div className="container">
          <div className="home-team-container">
            <div className="home-team-header">
              <h2 className="font-serif home-team-title">
                Verified Faculty Mentors & Coordinators
              </h2>
              <p className="home-team-subtitle">
                Academic faculty mentors evaluating proposals and providing technical direction.
              </p>
            </div>

            {/* Display ONLY Mentors with showOnHome enabled in Admin Panel */}
            {displayMentors.length > 0 ? (
              <div className="home-team-grid">
                {displayMentors.map(m => (
                  <div key={m.id} className="home-team-card">
                    <div 
                      className="home-team-avatar-circle"
                      style={{ backgroundColor: m.bg }}
                    >
                      {m.avatar}
                    </div>
                    <h4 className="home-team-name">
                      {m.name}
                    </h4>
                    <div className="home-team-role">
                      {m.role}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                Mentors are managed directly in the Admin Panel.
              </div>
            )}

            {/* LIVE REAL-TIME STATS: Active Projects, Students, Mentors */}
            <div className="home-stats-badges-row">
              <div className="stat-badge">
                <div className="stat-badge-number">{totalProjectsCount}</div>
                <div className="stat-badge-label">Active Projects</div>
              </div>

              <div className="stat-badge">
                <div className="stat-badge-number">{totalStudentsCount}</div>
                <div className="stat-badge-label">Students</div>
              </div>

              <div className="stat-badge">
                <div className="stat-badge-number">{totalMentorsCount}</div>
                <div className="stat-badge-label">Mentors</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS BOARD PREVIEW */}
      <section className="home-featured-section">
        <div className="container">
          <div className="home-featured-header">
            <div>
              <h2 className="font-serif home-featured-title">
                Active Collaboration Opportunities
              </h2>
              <p className="home-featured-subtitle">
                {currentUser 
                  ? 'Browse approved projects seeking student team members'
                  : 'Explore campus project ideas. Sign in to view team roles, mentor evaluations, and apply.'}
              </p>
            </div>
            <button onClick={onViewAllProjects} className="btn-outline">
              View All Projects <ArrowRight size={16} />
            </button>
          </div>

          <div className="home-projects-grid">
            {projects.slice(0, 6).map(p => (
              <div
                key={p.id}
                onClick={() => handleCardClick(p)}
                className={`home-project-card ${!currentUser ? 'unauthenticated-card' : ''}`}
              >
                {/* When NOT signed in: Show ONLY Cover Image, Project Name, and Description */}
                {!currentUser ? (
                  <div className="home-project-preview-wrapper">
                    <div className="home-project-image-box">
                      <img
                        src={getProjectCoverImage(p)}
                        alt={p.title}
                        className="home-project-cover-img"
                      />
                    </div>
                    <h3 className="home-project-title" style={{ marginTop: '14px', marginBottom: '6px' }}>
                      {p.title}
                    </h3>
                    <p className="home-project-desc" style={{ marginBottom: 0 }}>
                      {p.description}
                    </p>
                  </div>
                ) : (
                  /* When SIGNED IN: Show full project card details */
                  <>
                    <div className="home-project-top-row">
                      <span className="badge badge-green">{p.categoryTag || p.department}</span>
                      <span className="home-project-points">
                        +{p.pointsReward || 150} pts
                      </span>
                    </div>

                    <h3 className="home-project-title">
                      {p.title}
                    </h3>

                    <p className="home-project-desc">
                      {p.description}
                    </p>

                    <div className="home-project-footer">
                      <span>Mentor: {p.facultyMentor || 'Faculty Mentor'}</span>
                      <span className="home-project-apply-cta">Apply Now →</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
