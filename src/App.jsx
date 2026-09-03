import { useState, useEffect } from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyApprovalPanel } from './pages/FacultyApprovalPanel';
import { ChatPage } from './pages/ChatPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AdminPanelPage } from './pages/AdminPanelPage';
import { SubmitProjectModal } from './components/SubmitProjectModal';
import { HostProjectModal } from './components/HostProjectModal';
import { AuthModal } from './components/AuthModal';
import { FirebaseSettingsModal } from './components/FirebaseSettingsModal';
import { INITIAL_DEPARTMENTS } from './data/mockData';
import {
  saveProject,
  saveSubmission,
  updateSubmissionStatus,
  sendChatMessage,
  subscribeToApprovedProjects,
  subscribeToFacultySubmissions,
  subscribeToLeaderboard,
  subscribeToFacultyList,
  subscribeToChatMessages,
  listenToAuthChanges,
  logoutUser,
  addLeaderboardPoints
} from './services/firebaseService';
import './App.css';

export function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Synchronous session initialization from localStorage so refresh / tab close NEVER signs out
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscollab_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userRole, setUserRole] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscollab_user');
      return saved ? (JSON.parse(saved).role || 'Student') : 'Student';
    } catch {
      return 'Student';
    }
  });

  const [userPoints, setUserPoints] = useState(() => {
    try {
      const saved = localStorage.getItem('campuscollab_user');
      return saved ? (JSON.parse(saved).points || 0) : 0;
    } catch {
      return 0;
    }
  });

  // Pure Real Data synced from Firestore
  const [departments] = useState(INITIAL_DEPARTMENTS);
  const [projects, setProjects] = useState([]);
  const [facultySubmissions, setFacultySubmissions] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  // Navigation & Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // URL-based Admin Route (Hidden from UI navigation, accessible strictly via URL /admin or #/admin)
  useEffect(() => {
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();
      if (path === '/admin' || hash === '#/admin' || hash === '#admin' || search.includes('admin=true') || search.includes('page=admin')) {
        setActiveTab('admin');
      }
    };

    checkAdminRoute();
    window.addEventListener('popstate', checkAdminRoute);
    window.addEventListener('hashchange', checkAdminRoute);
    return () => {
      window.removeEventListener('popstate', checkAdminRoute);
      window.removeEventListener('hashchange', checkAdminRoute);
    };
  }, []);

  // Real-time Firestore Listeners on Mount
  useEffect(() => {
    const unsubProjects = subscribeToApprovedProjects((liveProjects) => setProjects(liveProjects));
    const unsubSubmissions = subscribeToFacultySubmissions((liveSubs) => setFacultySubmissions(liveSubs));
    const unsubLeaderboard = subscribeToLeaderboard((liveLeaderboard) => setLeaderboard(liveLeaderboard));
    const unsubFaculty = subscribeToFacultyList((liveFaculty) => setFacultyList(liveFaculty));

    const unsubAuth = listenToAuthChanges((usr) => {
      setCurrentUser(usr);
      if (usr) {
        setUserRole(usr.role);
        setUserPoints(usr.points || 0);
      } else {
        setUserRole('Student');
        setUserPoints(0);
      }
    });

    return () => {
      unsubProjects();
      unsubSubmissions();
      unsubLeaderboard();
      unsubFaculty();
      unsubAuth();
    };
  }, []);

  // Real-time Chat Listener across all channels
  useEffect(() => {
    const unsubChat = subscribeToChatMessages((liveMsgs) => {
      setMessages(liveMsgs);
    });

    return () => unsubChat();
  }, []);

  // Actions
  const handleSelectProject = (project) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedProject(project);
    setActiveTab('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyToProject = async (projectId, applicantNote = '', selectedRole = 'Developer') => {
    const applicantName = currentUser ? currentUser.displayName : 'Student Scholar';
    const targetProject = projects.find(p => p.id === projectId);
    
    if (targetProject) {
      const updatedProject = {
        ...targetProject,
        applicationsCount: (targetProject.applicationsCount || 0) + 1
      };
      await saveProject(updatedProject);
    }

    // Award automatic points upon team selection/application
    await addLeaderboardPoints(applicantName, 30, `Applied for ${selectedRole}`);
    setUserPoints(prev => prev + 30);
  };

  const handleApproveSubmission = async (submissionId, allottedBudget = 500) => {
    const sub = facultySubmissions.find(s => s.id === submissionId);
    if (!sub) return;

    await updateSubmissionStatus(submissionId, 'Approved');

    const finalBudget = allottedBudget || 500;
    const newProject = {
      id: sub.id.startsWith('proj-') ? sub.id : `proj-${Date.now()}`,
      title: sub.title,
      department: sub.department,
      categoryTag: sub.department,
      facultyMentor: currentUser ? currentUser.displayName : (sub.facultyMentor || 'Faculty Mentor'),
      facultyAvatar: '/faculty_mentor.png',
      status: 'Approved',
      description: sub.abstract,
      postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      deadlineDate: '2026-10-15',
      daysRemaining: 45,
      ownerName: sub.studentName,
      ownerEmail: sub.studentEmail || '',
      ownerAvatarBg: sub.studentAvatarBg || '#5FB245',
      totalPointsBudget: finalBudget,
      ownerPointsReward: Math.round(finalBudget * 0.4),
      pointsReward: finalBudget,
      requiredSkills: sub.requiredSkills || ['Research', 'Analysis', 'Collaboration'],
      teamMembers: [
        { id: `m-${Date.now()}`, name: sub.studentName, role: 'Lead Researcher & Author', avatar: sub.studentName ? sub.studentName.substring(0, 2).toUpperCase() : 'ST', avatarBg: sub.studentAvatarBg || '#5FB245' }
      ],
      maxTeamSize: sub.proposedTeamSize || 4,
      progressPercent: 15,
      reportFileName: sub.reportFileName,
      presentationFileName: sub.presentationFileName,
      applicationsCount: 0
    };

    await saveProject(newProject);
    await addLeaderboardPoints(sub.studentName, 50, 'Faculty Approved Proposal');
    if (currentUser && currentUser.displayName === sub.studentName) {
      setUserPoints(prev => prev + 50);
    }
  };

  const handleRejectSubmission = async (submissionId, feedbackText = '') => {
    await updateSubmissionStatus(submissionId, 'Needs Revision', {
      feedback: feedbackText || 'Please review and adjust your proposal abstract and team specifications.',
      feedbackAuthor: currentUser ? currentUser.displayName : 'Faculty Mentor',
      feedbackDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  };

  const handleSendMessage = async (projectId, text, attachmentName) => {
    const senderName = currentUser ? currentUser.displayName : (userRole === 'Student' ? 'Student Scholar' : 'Faculty Mentor');
    const newMsg = {
      id: `msg-${Date.now()}`,
      projectId,
      senderName,
      senderRole: userRole,
      avatarBg: userRole === 'Student' ? '#5FB245' : '#12210F',
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      attachmentName
    };

    await sendChatMessage(newMsg);
  };

  const handleNewProjectProposalSubmit = async (newProposal) => {
    const authorName = currentUser ? currentUser.displayName : 'Student Scholar';
    const authorEmail = currentUser ? currentUser.email : '';
    const newSub = {
      id: `sub-${Date.now()}`,
      title: newProposal.title,
      studentName: authorName,
      studentEmail: authorEmail,
      userId: currentUser?.uid || '',
      studentMajor: 'Academic Student',
      studentAvatarBg: '#5FB245',
      department: newProposal.department,
      submittedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      abstract: newProposal.description,
      proposedTeamSize: newProposal.maxTeamSize || 4,
      requiredSkills: newProposal.requiredSkills || ['Research', 'Data Analysis', 'Development'],
      facultyMentor: newProposal.facultyMentor || 'Dr. Sarah Jenkins',
      reportFileName: newProposal.reportFileName || 'Proposal_Abstract.pdf',
      reportFileData: newProposal.reportFileData || '',
      presentationFileName: newProposal.presentationFileName || 'Presentation_Deck.pptx',
      presentationFileData: newProposal.presentationFileData || '',
      status: 'Pending'
    };

    await saveSubmission(newSub);
    setActiveTab('dashboard');
  };

  const handleHostProjectSubmit = async (hostData) => {
    const existingProject = projects.find(p => p.id === hostData.projectId || p.title === hostData.title);

    const hostedProject = {
      id: existingProject ? existingProject.id : `proj-${Date.now()}`,
      title: hostData.title,
      department: hostData.department,
      categoryTag: hostData.department,
      facultyMentor: hostData.facultyMentor || 'Faculty Mentor',
      facultyAvatar: '/faculty_mentor.png',
      status: 'Approved',
      description: hostData.description,
      postedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      deadlineDate: '2026-10-15',
      daysRemaining: 45,
      ownerName: hostData.ownerName,
      ownerAvatarBg: hostData.ownerAvatarBg || '#5FB245',
      totalPointsBudget: hostData.totalPointsBudget || 500,
      ownerPointsReward: hostData.ownerPointsReward || 200,
      isRecruiting: true,
      recruitmentHeadline: hostData.recruitmentHeadline,
      openRoles: hostData.openRoles,
      rolePoints: hostData.rolePoints,
      requiredSkills: hostData.requiredSkills,
      teamMembers: existingProject?.teamMembers || [
        { id: `m-${Date.now()}`, name: hostData.ownerName, role: 'Project Host & Lead', avatar: hostData.ownerName ? hostData.ownerName.substring(0, 2).toUpperCase() : 'ST', avatarBg: '#5FB245' }
      ],
      maxTeamSize: hostData.maxTeamSize || 4,
      pointsReward: hostData.pointsReward || 150,
      progressPercent: existingProject?.progressPercent || 15,
      applicationsCount: existingProject?.applicationsCount || 0
    };

    await saveProject(hostedProject);
    setActiveTab('projects');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserRole('Student');
    setUserPoints(0);
    setActiveTab('home');
  };

  const handleExitAdmin = () => {
    setActiveTab('home');
    if (window.location.hash.includes('admin')) {
      window.location.hash = '';
    }
    if (window.location.pathname === '/admin') {
      window.history.pushState({}, '', '/');
    }
  };

  return (
    <div className="app-wrapper">
      {activeTab !== 'admin' && (
        <Navbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          userRole={userRole}
          setUserRole={setUserRole}
          userPoints={userPoints}
          onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
          currentUser={currentUser}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onLogout={handleLogout}
          onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
        />
      )}

      <main className="app-main-content">
        {activeTab === 'admin' && (
          <AdminPanelPage
            onExitAdmin={handleExitAdmin}
            departments={departments}
            projects={projects}
            submissions={facultySubmissions}
            leaderboard={leaderboard}
          />
        )}

        {activeTab === 'home' && (
          <HomePage
            departments={departments}
            projects={projects}
            submissions={facultySubmissions}
            facultyList={facultyList}
            leaderboard={leaderboard}
            onSelectProject={handleSelectProject}
            onViewAllProjects={() => {
              if (!currentUser) setIsAuthModalOpen(true);
              else setActiveTab('projects');
            }}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsPage
            projects={projects}
            departments={departments}
            onSelectProject={handleSelectProject}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onOpenHostModal={() => setIsHostModalOpen(true)}
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'detail' && (
          <ProjectDetailPage
            project={selectedProject || projects[0]}
            onBack={() => setActiveTab('projects')}
            userRole={userRole}
            onApplyToProject={handleApplyToProject}
            onApproveReject={(id, status) => {
              if (status === 'Approved') handleApproveSubmission(id);
              else handleRejectSubmission(id);
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboard
            projects={projects}
            submissions={facultySubmissions}
            userPoints={userPoints}
            onSelectProject={handleSelectProject}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            onOpenHostModal={() => setIsHostModalOpen(true)}
            currentUser={currentUser}
          />
        )}

        {/* FACULTY PORTAL - Guarded for Faculty Only */}
        {activeTab === 'faculty' && (
          userRole === 'Faculty' ? (
            <FacultyApprovalPanel
              submissions={facultySubmissions}
              onApprove={handleApproveSubmission}
              onReject={handleRejectSubmission}
            />
          ) : (
            <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
              <div style={{
                maxWidth: '500px',
                margin: '0 auto',
                backgroundColor: '#FFFFFF',
                borderRadius: '24px',
                padding: '40px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
              }}>
                <ShieldAlert size={56} color="#DC2626" style={{ margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2937', marginBottom: '8px' }}>
                  Faculty Portal Access Restricted
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  The proposal verification and review portal is reserved strictly for faculty mentors and coordinators. Student accounts cannot approve or review submissions.
                </p>
                <button
                  onClick={() => setActiveTab('projects')}
                  className="btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={16} /> Return to Projects Board
                </button>
              </div>
            </div>
          )
        )}

        {activeTab === 'chat' && (
          <ChatPage
            projects={projects}
            messages={messages}
            onSendMessage={handleSendMessage}
            userRole={userRole}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardPage
            leaderboard={leaderboard}
            currentUser={currentUser}
          />
        )}
      </main>

      <SubmitProjectModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        departments={departments}
        facultyList={facultyList}
        onSubmitProject={handleNewProjectProposalSubmit}
      />

      <HostProjectModal
        isOpen={isHostModalOpen}
        onClose={() => setIsHostModalOpen(false)}
        projects={projects}
        submissions={facultySubmissions}
        currentUser={currentUser}
        onHostProjectSubmit={handleHostProjectSubmit}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        userRole={userRole}
        onAuthSuccess={(usr) => {
          setCurrentUser(usr);
          setUserRole(usr.role);
          setUserPoints(usr.points || 0);
        }}
      />

      <FirebaseSettingsModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {activeTab !== 'admin' && <Footer />}
    </div>
  );
}

export default App;
