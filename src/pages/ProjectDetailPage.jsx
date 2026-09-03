import React, { useState } from 'react';
import { ArrowLeft, Clock, Award, FileText, Download, Users, Check, ShieldCheck, Send, Sparkles, Rocket, Briefcase, UserCheck } from 'lucide-react';
import './ProjectDetailPage.css';

export const ProjectDetailPage = ({
  project,
  onBack,
  userRole,
  onApplyToProject,
  onApproveReject
}) => {
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(project.openRoles?.[0]?.name || 'Full Stack Developer');
  const [applicantNote, setApplicantNote] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    onApplyToProject(project.id, applicantNote, selectedRole);
    setAppliedSuccess(true);
    setTimeout(() => {
      setAppliedSuccess(false);
      setShowApplyModal(false);
    }, 1800);
  };

  const totalBudget = project.totalPointsBudget || project.pointsReward || 500;
  const ownerPoints = project.ownerPointsReward || Math.round(totalBudget * 0.4);

  return (
    <div className="container detail-page-container animate-fade-in">
      {/* Breadcrumb */}
      <div className="detail-breadcrumb-row">
        <button onClick={onBack} className="detail-back-btn">
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <span>/</span>
        <span>{project.department}</span>
        <span>/</span>
        <span className="detail-breadcrumb-active">{project.title}</span>
      </div>

      <div className="detail-main-grid">
        {/* Left Column */}
        <div>
          <div className="detail-overview-card">
            <div className="detail-tag-header">
              <span className="badge badge-green">{project.categoryTag || project.department}</span>
              <div className="detail-status-group">
                {project.isRecruiting && (
                  <span style={{
                    backgroundColor: '#12210F',
                    color: 'var(--accent-green)',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Rocket size={12} /> Open for Recruitment
                  </span>
                )}
                <span className={project.status === 'Approved' ? 'badge badge-green' : 'badge badge-dark'}>
                  {project.status === 'Approved' ? 'Faculty Approved' : 'Pending Faculty Review'}
                </span>
                <span className="badge badge-green" style={{ fontSize: '13px' }}>
                  <Award size={14} /> {totalBudget} Pts Faculty Budget
                </span>
              </div>
            </div>

            <h1 className="font-serif detail-title">
              {project.title}
            </h1>

            {project.recruitmentHeadline && (
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '14px' }}>
                📢 {project.recruitmentHeadline}
              </div>
            )}

            <div className="detail-meta-row">
              <div className="detail-mentor-item">
                <Check size={16} color="var(--accent-green)" />
                <span>Mentor: <strong>{project.facultyMentor}</strong></span>
              </div>
              <div>Idea Author / Host: <strong>{project.ownerName}</strong></div>
              <div>Posted: {project.postedDate || 'Recent'}</div>
            </div>

            {/* OPEN ROLES & FACULTY POINTS BUDGET DISTRIBUTION */}
            <div className="detail-section-block">
              <h4 className="detail-section-heading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={18} color="var(--accent-green)" /> Points Budget & Role Allocation ({totalBudget} pts total)
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Allotted by Faculty mentor <strong>{project.facultyMentor}</strong>. Distributed by the idea author to team members; all remaining points credit to the author.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                marginTop: '10px'
              }}>
                {/* Idea Author Allocation */}
                <div style={{
                  backgroundColor: '#12210F',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <UserCheck size={14} /> Idea Author & Lead ({project.ownerName})
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#A3B899' }}>Remaining Budget:</span>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#FFFFFF' }}>
                      +{ownerPoints} pts
                    </span>
                  </div>
                </div>

                {/* Team Recruited Roles */}
                {project.openRoles && project.openRoles.length > 0 ? (
                  project.openRoles.map(role => (
                    <div key={role.id || role.name} style={{
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {role.name}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Role Reward:</span>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-green)' }}>
                          +{role.points} pts
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Team Collaborator</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Role Reward:</span>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-green)' }}>
                        +120 pts
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Required Skills Checklist */}
            <div className="detail-section-block">
              <h4 className="detail-section-heading">
                Required Technical Skills & Competencies
              </h4>
              <div className="detail-skills-checklist">
                {project.requiredSkills?.map(skill => (
                  <div key={skill} className="detail-skill-item">
                    <div className="detail-skill-check-icon">
                      <Check size={12} strokeWidth={3} />
                    </div>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Overview */}
            <div className="detail-section-block">
              <h4 className="detail-section-heading">
                Project Overview & Research Abstract
              </h4>
              <p className="detail-description-text">
                {project.description}
              </p>
            </div>

            {/* Attached Documentation */}
            <div>
              <h4 className="detail-section-heading">
                Attached Documents & Proposals
              </h4>
              <div className="detail-docs-grid">
                <div className="detail-doc-card">
                  <FileText size={24} color="var(--accent-green)" />
                  <div className="detail-doc-info">
                    <div className="detail-doc-name">
                      {project.reportFileName || 'proposal_report.pdf'}
                    </div>
                    <div className="detail-doc-size">PDF Document • 2.4 MB</div>
                  </div>
                  <button className="detail-doc-download-btn" title="Download Report">
                    <Download size={18} />
                  </button>
                </div>

                <div className="detail-doc-card">
                  <Sparkles size={24} color="var(--accent-green)" />
                  <div className="detail-doc-info">
                    <div className="detail-doc-name">
                      {project.presentationFileName || 'presentation_deck.pptx'}
                    </div>
                    <div className="detail-doc-size">Slides • 5.1 MB</div>
                  </div>
                  <button className="detail-doc-download-btn" title="Download Presentation">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTA Block */}
          <div className="detail-action-banner">
            <div>
              <h3 className="detail-banner-title">
                {userRole === 'Student' ? 'Interested in joining this project team?' : 'Faculty Verification Action'}
              </h3>
              <p className="detail-banner-desc">
                {userRole === 'Student' 
                  ? `Apply for an open role to collaborate with ${project.ownerName} and earn role-based reward points upon delivery.`
                  : 'Review student report submission and approve or request revision.'}
              </p>
            </div>

            {userRole === 'Student' ? (
              <button
                onClick={() => setShowApplyModal(true)}
                className="btn-primary"
                style={{ padding: '12px 28px', fontSize: '14px' }}
              >
                <Send size={18} /> Apply for Role
              </button>
            ) : (
              <div className="detail-faculty-actions">
                <button
                  onClick={() => onApproveReject(project.id, 'Approved')}
                  className="btn-primary"
                >
                  <ShieldCheck size={18} /> Approve
                </button>
                <button
                  onClick={() => onApproveReject(project.id, 'Rejected')}
                  className="btn-outline"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="detail-sidebar-col">
          {/* Stat Badge Deadline Card */}
          <div className="stat-badge">
            <Clock size={28} color="#FFFFFF" style={{ margin: '0 auto 8px' }} />
            <div className="stat-badge-number">{project.daysRemaining || 45} Days Left</div>
            <div className="stat-badge-label">Milestone Due: {project.deadlineDate || '2026-10-15'}</div>
          </div>

          {/* Points Box */}
          <div className="detail-points-box">
            <Award size={36} color="var(--accent-green)" style={{ margin: '0 auto 8px' }} />
            <div className="detail-points-number">
              {totalBudget} Total Project Points
            </div>
            <p className="detail-points-desc">
              Allotted by Faculty. Distributed to team members by role upon milestone delivery; remaining points credited to idea author.
            </p>
          </div>

          {/* Team Members List */}
          <div className="detail-team-box">
            <div className="detail-team-header">
              <div className="detail-team-title-group">
                <Users size={20} color="var(--accent-green)" />
                <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Team Roster</h3>
              </div>
              <span className="detail-team-capacity">
                {project.teamMembers?.length || 1} / {project.maxTeamSize || 4} Members
              </span>
            </div>

            <div className="detail-team-list">
              {project.teamMembers?.map(m => (
                <div key={m.id} className="detail-member-row">
                  <div 
                    className="detail-member-avatar"
                    style={{ backgroundColor: m.avatarBg || '#5FB245' }}
                  >
                    {m.avatar || (m.name ? m.name.substring(0, 2).toUpperCase() : 'ST')}
                  </div>
                  <div>
                    <div className="detail-member-name">{m.name}</div>
                    <div className="detail-member-role">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="auth-modal-backdrop">
          <div className="auth-modal-card animate-fade-in" style={{ width: '520px' }}>
            <h2 className="font-serif auth-modal-title" style={{ textAlign: 'left', marginBottom: '8px' }}>
              Apply to Join Team
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Select your role and send an application note to project host <strong>{project.ownerName}</strong>.
            </p>

            {appliedSuccess ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Check size={48} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--accent-green)' }}>Application Sent!</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  The project host will review your application for the <strong>{selectedRole}</strong> role.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Select Target Role */}
                <div>
                  <label className="auth-input-label">Select Role You Are Applying For</label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="auth-input-field"
                    style={{ fontWeight: 600 }}
                  >
                    {project.openRoles && project.openRoles.length > 0 ? (
                      project.openRoles.map(role => (
                        <option key={role.id || role.name} value={role.name}>
                          {role.name} (+{role.points} pts)
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Frontend Developer">Frontend Developer (+120 pts)</option>
                        <option value="Backend Developer">Backend Developer (+140 pts)</option>
                        <option value="Full Stack Developer">Full Stack Developer (+150 pts)</option>
                        <option value="UI/UX Designer">UI/UX Designer (+110 pts)</option>
                        <option value="Database Engineer">Database Engineer (+130 pts)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="auth-input-label">
                    Why are you a great fit for this role?
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={applicantNote}
                    onChange={(e) => setApplicantNote(e.target.value)}
                    placeholder="Highlight your relevant technical skills, portfolio/GitHub, or coursework..."
                    className="auth-input-field"
                    style={{ padding: '12px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button type="button" onClick={() => setShowApplyModal(false)} className="btn-outline">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Submit Role Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
