import React, { useState, useMemo } from 'react';
import { Send, Paperclip, MessageSquare, ShieldCheck, FileText, Globe, Users, GraduationCap, Sparkles } from 'lucide-react';
import './ChatPage.css';

export const ChatPage = ({
  projects = [],
  messages = [],
  onSendMessage,
  userRole = 'Student',
  currentUser
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState('channel-global');
  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);

  const isGlobalChannel = selectedChannelId === 'channel-global';
  const activeProject = projects.find(p => p.id === selectedChannelId);

  // Filter messages for current channel
  const channelMessages = useMemo(() => {
    return messages.filter(m => 
      isGlobalChannel ? (m.projectId === 'channel-global' || !m.projectId) : m.projectId === selectedChannelId
    );
  }, [messages, isGlobalChannel, selectedChannelId]);

  // Compute 100% REAL Participant & Mentor counts from database and active records (NO fake numbers)
  const { participantCount, mentorCount } = useMemo(() => {
    if (isGlobalChannel) {
      // Collect unique real participants who have sent messages, are on teams, or are current user
      const uniquePeople = new Set();
      const uniqueMentors = new Set();

      // From all active projects in database
      projects.forEach(p => {
        if (p.ownerName) uniquePeople.add(p.ownerName);
        p.teamMembers?.forEach(m => {
          if (m.name) uniquePeople.add(m.name);
        });
        if (p.facultyMentor) {
          uniqueMentors.add(p.facultyMentor);
          uniquePeople.add(p.facultyMentor);
        }
      });

      // From all sent messages
      messages.forEach(m => {
        if (m.senderName) {
          uniquePeople.add(m.senderName);
          if (m.senderRole === 'Faculty') {
            uniqueMentors.add(m.senderName);
          }
        }
      });

      // From current active logged in user
      if (currentUser?.displayName) {
        uniquePeople.add(currentUser.displayName);
        if (currentUser.role === 'Faculty') {
          uniqueMentors.add(currentUser.displayName);
        }
      }

      return {
        participantCount: uniquePeople.size || 1,
        mentorCount: uniqueMentors.size
      };
    } else {
      // Specific Project Team Channel
      const teamSize = activeProject?.teamMembers?.length || (activeProject?.ownerName ? 1 : 0);
      const hasMentor = activeProject?.facultyMentor ? 1 : 0;

      return {
        participantCount: teamSize + hasMentor,
        mentorCount: hasMentor
      };
    }
  }, [isGlobalChannel, projects, messages, currentUser, activeProject]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    onSendMessage(selectedChannelId, inputText.trim(), attachedFile || undefined);
    setInputText('');
    setAttachedFile(null);
  };

  return (
    <div className="container chat-page-container animate-fade-in">
      <div className="chat-window-card">
        {/* Left Sidebar: Channels List */}
        <aside className="chat-sidebar">
          <div className="chat-sidebar-header">
            <MessageSquare size={18} color="var(--accent-green)" />
            <h3 style={{ fontSize: '15px', fontWeight: 700 }}>Communication Hub</h3>
          </div>

          <div className="chat-channels-list">
            {/* 1. Main Global Campus Lounge Channel */}
            <button
              onClick={() => setSelectedChannelId('channel-global')}
              className={`chat-channel-item ${isGlobalChannel ? 'active' : ''}`}
              style={{ borderLeft: isGlobalChannel ? '4px solid var(--accent-green)' : 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={16} color="var(--accent-green)" />
                <div className="chat-channel-title" style={{ fontWeight: 800 }}>
                  Main Campus Lounge
                </div>
              </div>
              <div className="chat-channel-meta" style={{ marginTop: '3px' }}>
                All faculty, mentors & students
              </div>
            </button>

            <div style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '12px 14px 4px'
            }}>
              Project Team Channels ({projects.length})
            </div>

            {/* 2. Specific Project Team Channels */}
            {projects.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                No active project team channels yet.
              </div>
            ) : (
              projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedChannelId(p.id)}
                  className={`chat-channel-item ${selectedChannelId === p.id ? 'active' : ''}`}
                  style={{ borderLeft: selectedChannelId === p.id ? '4px solid var(--accent-green)' : 'none' }}
                >
                  <div className="chat-channel-title"># {p.title}</div>
                  <div className="chat-channel-meta">Mentor: {p.facultyMentor}</div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Right Main Message Panel */}
        <div className="chat-main-panel">
          {/* Top Bar Header with REAL Count Badges */}
          <div className="chat-panel-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isGlobalChannel ? (
                  <Globe size={20} color="var(--accent-green)" />
                ) : (
                  <Users size={20} color="var(--accent-green)" />
                )}
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {isGlobalChannel ? '🌐 Main Campus Lounge (Public Hub)' : `# ${activeProject?.title || 'Team Channel'}`}
                </h3>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {isGlobalChannel 
                  ? 'Open community workspace for all faculty coordinators, mentors & students'
                  : `Dedicated team workspace for ${activeProject?.department || 'Department'}`}
              </div>
            </div>

            {/* TOP BAR COUNT BADGES (Strictly Real Database Counts) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                <Users size={14} color="var(--accent-green)" />
                <span>{participantCount} {participantCount === 1 ? 'Participant' : 'Participants'}</span>
              </div>

              {mentorCount > 0 && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#E7F3DC',
                  color: '#2D6A1E',
                  padding: '6px 12px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  <GraduationCap size={14} color="var(--accent-green)" />
                  <span>{mentorCount} {mentorCount === 1 ? 'Mentor' : 'Mentors'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="chat-messages-stream">
            {channelMessages.length === 0 ? (
              <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
                {isGlobalChannel ? (
                  <Globe size={44} color="var(--accent-green)" style={{ margin: '0 auto 10px' }} />
                ) : (
                  <MessageSquare size={44} color="var(--accent-green)" style={{ margin: '0 auto 10px' }} />
                )}
                <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isGlobalChannel ? 'Welcome to Main Campus Lounge' : `Welcome to #${activeProject?.title}`}
                </h4>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  {isGlobalChannel
                    ? 'Say hello to campus peers, mentors, and faculty members!'
                    : 'Collaborate with your team members and assigned faculty mentor.'}
                </p>
              </div>
            ) : (
              channelMessages.map(m => {
                const currentUserName = currentUser ? currentUser.displayName : '';
                const isOwn = (currentUserName && m.senderName === currentUserName) ||
                              (!currentUserName && ((userRole === 'Student' && m.senderRole === 'Student') || (userRole === 'Faculty' && m.senderRole === 'Faculty')));

                return (
                  <div
                    key={m.id}
                    className={`chat-message-row ${isOwn ? 'is-own' : ''}`}
                  >
                    <div 
                      className="chat-msg-avatar"
                      style={{ backgroundColor: m.avatarBg || '#5FB245' }}
                    >
                      {m.senderName ? m.senderName.split(' ').map(n => n[0]).join('') : 'ST'}
                    </div>

                    <div className="chat-msg-bubble-wrapper">
                      <div className="chat-msg-header-row">
                        <span className="chat-msg-sender-name">{m.senderName}</span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: m.senderRole === 'Faculty' ? '#12210F' : '#E7F3DC',
                          color: m.senderRole === 'Faculty' ? '#FFFFFF' : '#2D6A1E'
                        }}>
                          {m.senderRole === 'Faculty' ? 'Faculty Mentor' : 'Student'}
                        </span>
                        <span className="chat-msg-timestamp">{m.timestamp || 'Just now'}</span>
                      </div>

                      <div className={`chat-bubble ${isOwn ? 'own' : 'other'}`}>
                        {m.message}
                      </div>

                      {m.attachmentName && (
                        <div className={`chat-attachment-pill ${isOwn ? 'own' : 'other'}`}>
                          <FileText size={14} /> {m.attachmentName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSend} className="chat-input-bar">
            <button
              type="button"
              onClick={() => setAttachedFile(attachedFile ? null : 'deliverable_spec.pdf')}
              style={{ color: attachedFile ? 'var(--accent-green)' : '#9CA3AF' }}
              title="Attach File"
            >
              <Paperclip size={20} />
            </button>

            {attachedFile && (
              <span className="badge badge-green" style={{ fontSize: '11px' }}>
                {attachedFile} ✕
              </span>
            )}

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isGlobalChannel ? 'Message Main Campus Lounge...' : `Message #${activeProject?.title || 'team'}...`}
              className="chat-input-field"
            />

            <button
              type="submit"
              className="btn-primary"
              style={{ borderRadius: '50%', width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
