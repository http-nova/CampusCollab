import React, { useState, useMemo } from 'react';
import { Rocket, Plus, X, Award, Users, Check, Tag, Sparkles, AlertTriangle, ShieldCheck, FolderPlus } from 'lucide-react';
import './HostProjectModal.css';

const DEFAULT_AVAILABLE_ROLES = [
  { id: 'frontend', name: 'Frontend Developer', defaultPts: 120 },
  { id: 'backend', name: 'Backend Developer', defaultPts: 140 },
  { id: 'fullstack', name: 'Full Stack Developer', defaultPts: 150 },
  { id: 'database', name: 'Database Engineer', defaultPts: 110 },
  { id: 'designer', name: 'UI/UX Designer', defaultPts: 100 },
  { id: 'aiml', name: 'AI / ML Specialist', defaultPts: 150 },
  { id: 'mobile', name: 'Mobile App Developer', defaultPts: 125 },
  { id: 'devops', name: 'DevOps & Cloud Engineer', defaultPts: 130 }
];

const DEFAULT_SKILL_SUGGESTIONS = [
  'React', 'Vue', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB',
  'Figma', 'UI Design', 'PyTorch', 'TensorFlow', 'REST API', 'GraphQL',
  'Docker', 'AWS', 'Flutter', 'React Native', 'TailwindCSS', 'TypeScript'
];

export const HostProjectModal = ({
  isOpen,
  onClose,
  projects = [],
  submissions = [],
  currentUser,
  onHostProjectSubmit
}) => {
  // ALL HOOKS CALLED UNCONDITIONALLY AT THE TOP
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [recruitmentHeadline, setRecruitmentHeadline] = useState('');
  const [selectedRoles, setSelectedRoles] = useState(['frontend', 'backend', 'designer']);
  const [rolePoints, setRolePoints] = useState({
    frontend: 120,
    backend: 140,
    fullstack: 150,
    database: 110,
    designer: 100,
    aiml: 150,
    mobile: 125,
    devops: 130
  });
  const [selectedSkills, setSelectedSkills] = useState(['React', 'Node.js', 'Figma']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [isSuccess, setIsSuccess] = useState(false);

  const studentName = currentUser?.displayName || '';
  const studentEmail = currentUser?.email || '';

  // STRICT AUTHOR CHECK: Only include proposals and projects submitted by THIS student
  const myOwnProjects = useMemo(() => {
    if (!currentUser) return [];

    const mySubmissions = submissions
      .filter(s => {
        if (studentEmail && s.studentEmail && s.studentEmail === studentEmail) return true;
        if (studentName && s.studentName && (
          s.studentName.toLowerCase().trim() === studentName.toLowerCase().trim() ||
          s.studentName.toLowerCase().includes(studentName.toLowerCase())
        )) return true;
        return false;
      })
      .map(s => ({
        id: s.id,
        title: s.title,
        department: s.department,
        description: s.abstract || 'Student proposed project',
        abstract: s.abstract,
        ownerName: s.studentName,
        studentName: s.studentName,
        totalPointsBudget: s.totalPointsBudget || 500,
        status: s.status || 'Approved'
      }));

    const myProjectsFromBoard = projects.filter(p => {
      if (studentEmail && p.ownerEmail && p.ownerEmail === studentEmail) return true;
      if (studentName && p.ownerName && (
        p.ownerName.toLowerCase().trim() === studentName.toLowerCase().trim() ||
        p.ownerName.toLowerCase().includes(studentName.toLowerCase())
      )) return true;
      return false;
    });

    const combined = [...mySubmissions, ...myProjectsFromBoard];
    return combined.filter((v, i, a) => v && v.title && a.findIndex(t => t?.title?.toLowerCase() === v?.title?.toLowerCase()) === i);
  }, [submissions, projects, currentUser, studentName, studentEmail]);

  const activeProject = useMemo(() => {
    return myOwnProjects.find(p => p.id === selectedProjectId) || myOwnProjects[0] || null;
  }, [myOwnProjects, selectedProjectId]);

  // Faculty-allotted points budget
  const facultyAllottedBudget = activeProject?.totalPointsBudget || 500;

  // Calculate total allocated to recruited team roles
  const teamAllocatedPoints = useMemo(() => {
    return selectedRoles.reduce((sum, roleId) => sum + (rolePoints[roleId] || 0), 0);
  }, [selectedRoles, rolePoints]);

  // Remaining points automatically credited to the student who submitted the idea
  const remainingOwnerPoints = facultyAllottedBudget - teamAllocatedPoints;
  const isBudgetExceeded = remainingOwnerPoints < 0;

  if (!isOpen) return null;

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  const handlePointChange = (roleId, value) => {
    setRolePoints(prev => ({
      ...prev,
      [roleId]: parseInt(value) || 0
    }));
  };

  const toggleSkill = (skill) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = (e) => {
    e.preventDefault();
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills(prev => [...prev, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!activeProject || isBudgetExceeded) return;

    const formattedOpenRoles = selectedRoles.map(rId => {
      const roleObj = DEFAULT_AVAILABLE_ROLES.find(r => r.id === rId);
      return {
        id: rId,
        name: roleObj ? roleObj.name : rId,
        points: rolePoints[rId] || 100,
        status: 'Open'
      };
    });

    const hostData = {
      projectId: activeProject.id,
      title: activeProject.title,
      department: activeProject.department || 'Computer Science & AI',
      description: activeProject.description || activeProject.abstract || 'Project open for team recruitment',
      ownerName: currentUser?.displayName || activeProject.ownerName,
      ownerEmail: currentUser?.email || '',
      ownerAvatarBg: activeProject.ownerAvatarBg || '#5FB245',
      facultyMentor: activeProject.facultyMentor || 'Faculty Mentor',
      totalPointsBudget: facultyAllottedBudget,
      ownerPointsReward: Math.max(0, remainingOwnerPoints),
      isRecruiting: true,
      recruitmentHeadline: recruitmentHeadline || `Looking for talented students to build ${activeProject.title}`,
      openRoles: formattedOpenRoles,
      rolePoints,
      requiredSkills: selectedSkills,
      maxTeamSize,
      pointsReward: facultyAllottedBudget,
      status: 'Approved'
    };

    onHostProjectSubmit(hostData);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="host-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="host-modal-card animate-fade-in">
        <button onClick={onClose} className="host-modal-close" aria-label="Close">✕</button>

        <div className="host-modal-header">
          <div className="host-modal-tag">
            <Rocket size={14} /> Student Project Hosting & Points Distribution
          </div>
          <h2 className="font-serif host-modal-title">
            Host Your Project & Recruit Team
          </h2>
          <p className="host-modal-subtitle">
            Recruit student collaborators for your submitted idea. You can only host ideas you submitted yourself.
          </p>
        </div>

        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Check size={52} color="var(--accent-green)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Project Hosted Successfully!
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>
              Your recruitment listing and role points budget are now live on the public Projects board.
            </p>
          </div>
        ) : myOwnProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#F9FAFB', borderRadius: '16px', border: '1px dashed #E5E7EB' }}>
            <FolderPlus size={44} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              No Submitted Ideas Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', maxWidth: '420px', margin: '6px auto 20px' }}>
              You can only host and recruit team members for your own project ideas. Submit your proposal first via the Workspace!
            </p>
            <button onClick={onClose} className="btn-primary" style={{ padding: '10px 24px', fontSize: '13px' }}>
              Got It
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="host-form">
            {/* 1. Choose Project (Strictly student's own projects) */}
            <div>
              <label className="auth-input-label">Select Your Submitted Idea to Host</label>
              <select
                value={selectedProjectId || activeProject?.id}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="auth-input-field"
                style={{ fontWeight: 600 }}
              >
                {myOwnProjects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.department}) - Faculty Budget: {p.totalPointsBudget || 500} pts
                  </option>
                ))}
              </select>
            </div>

            {/* LIVE BUDGET CALCULATOR CARD */}
            <div style={{
              backgroundColor: isBudgetExceeded ? '#FEF2F2' : '#12210F',
              color: isBudgetExceeded ? '#991B1B' : '#FFFFFF',
              border: isBudgetExceeded ? '2px solid #F87171' : '1px solid var(--accent-green)',
              borderRadius: '16px',
              padding: '18px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={20} color={isBudgetExceeded ? '#DC2626' : 'var(--accent-green)'} />
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>
                    Faculty-Allotted Project Budget:
                  </span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 900, color: isBudgetExceeded ? '#DC2626' : 'var(--accent-green)' }}>
                  {facultyAllottedBudget} pts
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: isBudgetExceeded ? '#B91C1C' : '#A3B899' }}>
                    Team Roles Allocated:
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>
                    {teamAllocatedPoints} pts ({selectedRoles.length} roles)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: isBudgetExceeded ? '#B91C1C' : '#A3B899' }}>
                    Remaining Credited to You (Idea Author):
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: isBudgetExceeded ? '#DC2626' : 'var(--accent-green)' }}>
                    +{Math.max(0, remainingOwnerPoints)} pts
                  </div>
                </div>
              </div>

              {isBudgetExceeded && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>
                  <AlertTriangle size={14} /> Allocated points exceed the faculty budget by {Math.abs(remainingOwnerPoints)} pts. Reduce role points below.
                </div>
              )}
            </div>

            {/* 2. Recruitment Pitch Headline */}
            <div>
              <label className="auth-input-label">Recruitment Headline & Pitch</label>
              <input
                type="text"
                value={recruitmentHeadline}
                onChange={(e) => setRecruitmentHeadline(e.target.value)}
                placeholder="e.g. Building Next-Gen AI Campus Assistant. Looking for Frontend & ML Devs!"
                className="auth-input-field"
              />
            </div>

            {/* 3. Open Roles Selection */}
            <div>
              <label className="auth-input-label">
                Select Roles Needed for Your Team ({selectedRoles.length} selected)
              </label>
              <div className="host-roles-grid">
                {DEFAULT_AVAILABLE_ROLES.map(role => {
                  const isSelected = selectedRoles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      className={`host-role-choice-btn ${isSelected ? 'selected' : ''}`}
                    >
                      <span>{role.name}</span>
                      {isSelected ? <Check size={16} color="var(--accent-green)" /> : <Plus size={16} color="#9CA3AF" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Role-Based Points Distribution */}
            {selectedRoles.length > 0 && (
              <div className="host-points-distribution-box">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <Award size={18} color="var(--accent-green)" />
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    Distribute Points from Budget to Each Role
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Adjust how many points each team member earns. Whatever is unallocated goes directly to your account.
                </p>

                {selectedRoles.map(roleId => {
                  const roleObj = DEFAULT_AVAILABLE_ROLES.find(r => r.id === roleId);
                  return (
                    <div key={roleId} className="host-role-points-row">
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                        {roleObj?.name || roleId}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reward:</span>
                        <input
                          type="number"
                          min="10"
                          max={facultyAllottedBudget}
                          step="10"
                          value={rolePoints[roleId] || 100}
                          onChange={(e) => handlePointChange(roleId, e.target.value)}
                          className="host-points-input"
                        />
                        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)' }}>pts</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. Required Technical Skill Tags */}
            <div>
              <label className="auth-input-label">Required Technical Skill Tags</label>
              <div className="host-tags-cloud">
                {DEFAULT_SKILL_SUGGESTIONS.map(skill => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`host-skill-chip ${isSelected ? 'active' : ''}`}
                    >
                      {skill} {isSelected ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>

              {/* Custom Skill Adder */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  placeholder="Add custom tag (e.g. Next.js, Solidity)..."
                  className="auth-input-field"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addCustomSkill}
                  className="btn-outline"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <Plus size={14} /> Add Tag
                </button>
              </div>
            </div>

            {/* 6. Max Team Size */}
            <div>
              <label className="auth-input-label">Target Team Capacity (Members)</label>
              <select
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(parseInt(e.target.value))}
                className="auth-input-field"
              >
                <option value={2}>2 Members (Pair Collaboration)</option>
                <option value={3}>3 Members (Core Squad)</option>
                <option value={4}>4 Members (Standard Team)</option>
                <option value={5}>5 Members (Large Squad)</option>
                <option value={6}>6 Members (Cross-functional)</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button type="button" onClick={onClose} className="btn-outline">
                Cancel
              </button>
              <button
                type="submit"
                disabled={isBudgetExceeded}
                className="btn-primary"
                style={{
                  padding: '12px 28px',
                  fontSize: '14px',
                  opacity: isBudgetExceeded ? 0.6 : 1,
                  cursor: isBudgetExceeded ? 'not-allowed' : 'pointer'
                }}
              >
                <Rocket size={16} /> Host & Publish Recruitment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
