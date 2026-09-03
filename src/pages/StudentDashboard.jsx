import React, { useState } from 'react';
import { Layers, Award, Clock, ArrowRight, FolderPlus, MessageSquare, CheckCircle, FileText, AlertCircle, Sparkles, Send, ShieldCheck, Rocket } from 'lucide-react';
import './StudentDashboard.css';

export const StudentDashboard = ({
  projects = [],
  submissions = [],
  userPoints = 0,
  onSelectProject,
  onNavigateTab,
  onOpenSubmitModal,
  onOpenHostModal,
  currentUser
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState('mySubmissions');

  const studentName = currentUser?.displayName || '';
  const studentEmail = currentUser?.email || '';
  const studentUid = currentUser?.uid || '';

  const isProjectOwner = (p) => {
    if (!currentUser) return false;
    const userEmail = studentEmail.toLowerCase().trim();
    const userName = studentName.toLowerCase().trim();

    if (p.ownerEmail && userEmail && p.ownerEmail.toLowerCase().trim() === userEmail) return true;
    if (p.studentEmail && userEmail && p.studentEmail.toLowerCase().trim() === userEmail) return true;
    if (p.ownerId && studentUid && p.ownerId === studentUid) return true;
    if (p.userId && studentUid && p.userId === studentUid) return true;

    if (p.ownerName && userName && p.ownerName.toLowerCase().trim() === userName) return true;
    if (p.studentName && userName && p.studentName.toLowerCase().trim() === userName) return true;
    return false;
  };

  // Filter student's own submissions ONLY
  const mySubmissions = submissions.filter(s => {
    if (!currentUser) return false;
    const userEmail = studentEmail.toLowerCase().trim();
    const userName = studentName.toLowerCase().trim();

    if (s.studentEmail && userEmail && s.studentEmail.toLowerCase().trim() === userEmail) return true;
    if (s.userId && studentUid && s.userId === studentUid) return true;
    if (s.studentName && userName && s.studentName.toLowerCase().trim() === userName) return true;
    return false;
  });

  // Filter student's active projects (owned by student OR student is enrolled team member)
  const myProjectsFromBoard = projects.filter(p => {
    if (!currentUser) return false;
    if (isProjectOwner(p)) return true;

    const userEmail = studentEmail.toLowerCase().trim();
    const userName = studentName.toLowerCase().trim();

    // Check if enrolled as a team member
    if (p.teamMembers && Array.isArray(p.teamMembers)) {
      return p.teamMembers.some(m => 
        (m.email && userEmail && m.email.toLowerCase().trim() === userEmail) ||
        (m.id && studentUid && m.id === studentUid) ||
        (m.name && userName && m.name.toLowerCase().trim() === userName)
      );
    }
    return false;
  });

  // Also include student's approved submissions as active projects
  const approvedSubmissionProjects = mySubmissions
    .filter(s => s.status === 'Approved')
    .map(s => {
      const existing = myProjectsFromBoard.find(p => p.title?.toLowerCase() === s.title?.toLowerCase() || p.id === s.id);
      if (existing) return null;
      return {
        id: s.id,
        title: s.title,
        department: s.department,
        facultyMentor: s.facultyMentor || 'Faculty Mentor',
        ownerName: s.studentName,
        ownerEmail: s.studentEmail || '',
        deadlineDate: '2026-10-15',
        pointsReward: s.totalPointsBudget || 500,
        progressPercent: 15,
        teamMembers: [
          { id: `m-${s.id}`, name: s.studentName, role: 'Lead Author & Researcher', avatar: s.studentName ? s.studentName.substring(0, 2).toUpperCase() : 'ST', avatarBg: s.studentAvatarBg || '#5FB245' }
        ],
        description: s.abstract,
        reportFileName: s.reportFileName,
        presentationFileName: s.presentationFileName,
        status: 'Approved'
      };
    })
    .filter(Boolean);

  const myProjects = [...myProjectsFromBoard, ...approvedSubmissionProjects];

  return (
    <div className="container dashboard-container animate-fade-in">
      {/* 3 Green Stat Badges Row */}
      <div className="dashboard-stats-row">
        <div className="stat-badge">
          <Award size={28} color="#FFFFFF" style={{ margin: '0 auto 8px' }} />
          <div className="stat-badge-number">{userPoints} pts</div>
          <div className="stat-badge-label">Verified Reward Points</div>
        </div>

        <div className="stat-badge">
          <Send size={28} color="#FFFFFF" style={{ margin: '0 auto 8px' }} />
          <div className="stat-badge-number">{mySubmissions.length} Submitted</div>
          <div className="stat-badge-label">My Project Proposals</div>
        </div>

        <div className="stat-badge">
          <Layers size={28} color="#FFFFFF" style={{ margin: '0 auto 8px' }} />
          <div className="stat-badge-number">{myProjects.length} Active</div>
          <div className="stat-badge-label">Approved Active Projects</div>
        </div>
      </div>

      {/* Main Dashboard Layout */}
      <div className="dashboard-main-layout">
        {/* Sidebar Nav */}
        <aside className="dashboard-sidebar-nav">
          <div className="dashboard-sidebar-title">Student Workspace</div>

          <button
            onClick={() => setSelectedSubTab('mySubmissions')}
            className={`dashboard-nav-item ${selectedSubTab === 'mySubmissions' ? 'active' : ''}`}
          >
            <Send size={18} /> My Submitted Ideas ({mySubmissions.length})
          </button>

          <button
            onClick={() => setSelectedSubTab('myProjects')}
            className={`dashboard-nav-item ${selectedSubTab === 'myProjects' ? 'active' : ''}`}
          >
            <Layers size={18} /> Active Projects ({myProjects.length})
          </button>

          <button
            onClick={() => setSelectedSubTab('applications')}
            className={`dashboard-nav-item ${selectedSubTab === 'applications' ? 'active' : ''}`}
          >
            <FileText size={18} /> My Applications
          </button>

          <button
            onClick={() => onNavigateTab('chat')}
            className="dashboard-nav-item"
          >
            <MessageSquare size={18} /> Team Chat
          </button>

          <button
            onClick={() => onNavigateTab('leaderboard')}
            className="dashboard-nav-item"
          >
            <Award size={18} /> Leaderboard & Points
          </button>

          <div className="dashboard-submit-cta-box" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {onOpenHostModal && (
              <button
                onClick={onOpenHostModal}
                className="btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '13px', backgroundColor: '#1D2E19', border: '1px solid var(--accent-green)' }}
              >
                <Rocket size={16} color="var(--accent-green)" /> Host Team Recruitment
              </button>
            )}
            <button
              onClick={onOpenSubmitModal}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '13px' }}
            >
              <FolderPlus size={16} /> Submit New Idea
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="dashboard-content-card">
          <div className="dashboard-content-header">
            <div>
              <h2 className="font-serif dashboard-section-title">
                {selectedSubTab === 'mySubmissions' && 'My Submitted Project Ideas'}
                {selectedSubTab === 'myProjects' && 'My Active Project Collaborations'}
                {selectedSubTab === 'applications' && 'My Team Applications'}
              </h2>
              <p className="dashboard-section-subtitle">
                {selectedSubTab === 'mySubmissions' && 'Track proposal review status, mentor evaluations, and host approved projects for team recruitment'}
                {selectedSubTab === 'myProjects' && 'Manage your approved projects, deliverables, open roles, and team collaboration'}
                {selectedSubTab === 'applications' && 'Track applications you submitted to join student collaboration teams'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {onOpenHostModal && (
                <button onClick={onOpenHostModal} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                  <Rocket size={14} /> Host Project
                </button>
              )}
              <button onClick={() => onNavigateTab('projects')} className="btn-outline" style={{ fontSize: '13px' }}>
                Browse All Projects
              </button>
            </div>
          </div>

          {/* TAB 1: MY SUBMITTED IDEAS */}
          {selectedSubTab === 'mySubmissions' && (
            mySubmissions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', border: '1px dashed #E5E7EB', borderRadius: '16px' }}>
                <FolderPlus size={44} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  No Submitted Project Proposals Yet
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '420px', margin: '6px auto 20px' }}>
                  Have an innovative academic concept or research paper? Submit your idea for faculty mentorship review and earn +50 points upon approval.
                </p>
                <button
                  onClick={onOpenSubmitModal}
                  className="btn-primary"
                  style={{ padding: '10px 22px', fontSize: '13px' }}
                >
                  <FolderPlus size={16} /> Submit Your First Idea
                </button>
              </div>
            ) : (
              <div className="dashboard-project-list">
                {mySubmissions.map(s => (
                  <div key={s.id} className="dashboard-project-card">
                    <div className="dashboard-card-top-row">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span className="badge badge-green">{s.department}</span>
                          
                          {s.status === 'Pending' && (
                            <span className="status-pill-pending">
                              <Clock size={12} /> Pending Faculty Review
                            </span>
                          )}
                          {s.status === 'Approved' && (
                            <span className="status-pill-approved">
                              <CheckCircle size={12} /> Approved & Published (+50 pts)
                            </span>
                          )}
                          {s.status === 'Needs Revision' && (
                            <span className="status-pill-revision">
                              <AlertCircle size={12} /> Needs Revision
                            </span>
                          )}
                        </div>

                        <h3 className="dashboard-card-title">{s.title}</h3>
                        <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5, margin: '6px 0 12px' }}>
                          {s.abstract}
                        </p>

                        <div className="dashboard-card-meta">
                          Submitted: <strong>{s.submittedDate || 'Recently'}</strong> • Assigned Faculty Mentor: <strong>{s.facultyMentor}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                        {s.status === 'Approved' && onOpenHostModal && isProjectOwner(s) && (
                          <button
                            onClick={onOpenHostModal}
                            className="btn-primary"
                            style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap', backgroundColor: '#12210F' }}
                          >
                            <Rocket size={14} /> Host & Recruit Team
                          </button>
                        )}
                        {s.status === 'Approved' && (
                          <button
                            onClick={() => setSelectedSubTab('myProjects')}
                            className="btn-outline"
                            style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
                          >
                            View in Active Projects <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Faculty Revision Feedback Box */}
                    {s.status === 'Needs Revision' && (
                      <div style={{
                        marginTop: '12px',
                        marginBottom: '12px',
                        backgroundColor: '#FFFBEB',
                        border: '1px solid #FCD34D',
                        borderRadius: '12px',
                        padding: '14px 16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#92400E', marginBottom: '4px' }}>
                          <AlertCircle size={16} color="#D97706" />
                          <span>Faculty Feedback ({s.feedbackAuthor || s.facultyMentor || 'Faculty Mentor'}):</span>
                        </div>
                        <p style={{ fontSize: '13px', color: '#78350F', lineHeight: 1.5, margin: 0 }}>
                          "{s.feedback || 'Please clarify your system architecture and update your proposal details.'}"
                        </p>
                      </div>
                    )}

                    {/* Files & Proposed Details */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #F3F4F6', fontSize: '12px', color: '#6B7280' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {s.reportFileName && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <FileText size={14} color="var(--accent-green)" /> {s.reportFileName}
                          </span>
                        )}
                        {s.presentationFileName && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Sparkles size={14} color="var(--accent-green)" /> {s.presentationFileName}
                          </span>
                        )}
                      </div>

                      <div>
                        Proposed Team Size: <strong>{s.proposedTeamSize || 4} Members</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 2: ACTIVE PROJECTS */}
          {selectedSubTab === 'myProjects' && (
            myProjects.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 20px', border: '1px dashed #E5E7EB', borderRadius: '16px' }}>
                <Layers size={44} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>No Active Projects Enrolled</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '420px', margin: '6px auto 20px' }}>
                  Once your submitted proposal is approved by faculty or you join a campus project team, it will appear here with active milestones.
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button onClick={() => setSelectedSubTab('mySubmissions')} className="btn-primary" style={{ fontSize: '13px' }}>
                    Check Submitted Proposals
                  </button>
                  <button onClick={() => onNavigateTab('projects')} className="btn-outline" style={{ fontSize: '13px' }}>
                    Explore Public Projects
                  </button>
                </div>
              </div>
            ) : (
              <div className="dashboard-project-list">
                {myProjects.map(p => (
                  <div key={p.id} className="dashboard-project-card">
                    <div className="dashboard-card-top-row">
                      <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <span className="badge badge-green">{p.department}</span>
                          <span className="badge badge-dark">Deadline: {p.deadlineDate || '2026-10-15'}</span>
                          <span className="status-pill-approved">
                            <ShieldCheck size={12} /> Faculty Approved
                          </span>
                        </div>
                        <h3 className="dashboard-card-title">{p.title}</h3>
                        <div className="dashboard-card-meta">
                          Mentor: <strong>{p.facultyMentor}</strong> • Owner / Lead: <strong>{p.ownerName}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-green)' }}>
                          +{p.pointsReward || 150} pts
                        </span>
                        {/* ONLY OWNER CAN EDIT OPEN ROLES */}
                        {onOpenHostModal && isProjectOwner(p) && (
                          <button
                            onClick={onOpenHostModal}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '11px', backgroundColor: '#12210F' }}
                          >
                            <Rocket size={12} /> Edit Open Roles
                          </button>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.5 }}>
                      {p.description}
                    </p>

                    {/* Progress Meter */}
                    <div className="dashboard-progress-wrapper">
                      <div className="dashboard-progress-label-row">
                        <span style={{ color: 'var(--text-muted)' }}>Deliverable Milestone Progress</span>
                        <span style={{ color: 'var(--accent-green)' }}>{p.progressPercent || 15}% Completed</span>
                      </div>
                      <div className="dashboard-progress-track">
                        <div 
                          className="dashboard-progress-fill" 
                          style={{ width: `${p.progressPercent || 15}%` }} 
                        />
                      </div>
                    </div>

                    <div className="dashboard-card-actions-row">
                      <div className="dashboard-team-avatars-row">
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '6px' }}>Team:</span>
                        {p.teamMembers?.map(m => (
                          <div 
                            key={m.id} 
                            className="dashboard-team-avatar-mini"
                            style={{ backgroundColor: m.avatarBg || '#5FB245' }}
                            title={`${m.name} (${m.role})`}
                          >
                            {m.avatar || (m.name ? m.name.substring(0, 2).toUpperCase() : 'ST')}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => onSelectProject(p)}
                        className="btn-outline"
                        style={{ padding: '8px 16px', fontSize: '13px' }}
                      >
                        Project Workspace Details <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* TAB 3: APPLICATIONS */}
          {selectedSubTab === 'applications' && (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <CheckCircle size={48} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Project Applications</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px', maxWidth: '440px', margin: '4px auto 0' }}>
                When you apply to open projects on the Projects board, applications are sent directly to the faculty mentor and project lead for review.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
