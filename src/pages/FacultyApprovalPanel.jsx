import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Check, X, FileText, Sparkles, AlertCircle, Award, Eye, MessageSquare, ChevronLeft, ChevronRight, ExternalLink, Layers } from 'lucide-react';
import './FacultyApprovalPanel.css';

export const FacultyApprovalPanel = ({
  submissions = [],
  onApprove,
  onReject
}) => {
  const [selectedSub, setSelectedSub] = useState(null);
  const [allottedBudget, setAllottedBudget] = useState(500);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // On-Site Document & Presentation Viewer Modal State
  const [docViewerData, setDocViewerData] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [pdfBlobUrl, setPdfBlobUrl] = useState('');

  // Revision Feedback Modal State
  const [feedbackSub, setFeedbackSub] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const pendingSubmissions = submissions.filter(s => s.status === 'Pending');

  // Convert base64 PDF data URI into a Blob URL for reliable browser embed
  useEffect(() => {
    if (docViewerData && docViewerData.fileData && docViewerData.fileData.startsWith('data:application/pdf')) {
      try {
        const base64Data = docViewerData.fileData.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.warn('PDF blob conversion fallback:', err);
        setPdfBlobUrl(docViewerData.fileData);
      }
    } else {
      setPdfBlobUrl('');
    }
  }, [docViewerData]);

  const handleApproveClick = (id, customBudget) => {
    const finalBudget = customBudget || allottedBudget || 500;
    onApprove(id, finalBudget);
    setActionSuccessMsg(`Proposal approved with ${finalBudget} pts total budget and published to the collaboration board!`);
    setSelectedSub(null);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleOpenFeedbackModal = (sub) => {
    setFeedbackSub(sub);
    setFeedbackText('');
    setFeedbackError('');
  };

  const handleSendFeedbackAndReject = (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      setFeedbackError('Please write feedback explaining to the student what changes are required.');
      return;
    }

    onReject(feedbackSub.id, feedbackText.trim());
    setActionSuccessMsg(`Revision request with feedback sent to ${feedbackSub.studentName}.`);
    setFeedbackSub(null);
    setSelectedSub(null);
    setFeedbackText('');
    setFeedbackError('');
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const openDocumentViewer = (sub, docType) => {
    setCurrentSlideIndex(0);
    setDocViewerData({
      sub,
      docType, // 'pdf' or 'ppt'
      fileName: docType === 'pdf' ? (sub.reportFileName || 'Proposal_Document.pdf') : (sub.presentationFileName || 'Pitch_Deck.pptx'),
      fileData: docType === 'pdf' ? sub.reportFileData : sub.presentationFileData
    });
  };

  return (
    <div className="container faculty-panel-container animate-fade-in">
      {/* Header Banner */}
      <div className="faculty-header-banner">
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(95, 178, 69, 0.2)',
            color: 'var(--accent-green)',
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px'
          }}>
            <ShieldCheck size={16} /> Faculty Review Portal
          </div>
          <h1 className="font-serif faculty-banner-title">
            Academic Project Review & Points Allotment
          </h1>
          <p className="faculty-banner-desc">
            Review student project proposals, preview submitted PDFs and presentation decks on-site, provide feedback, and assign total reward point budgets.
          </p>
        </div>

        <div className="faculty-pending-count-box">
          <div className="faculty-pending-count-num">{pendingSubmissions.length}</div>
          <div className="faculty-pending-count-label">Awaiting Verification</div>
        </div>
      </div>

      {actionSuccessMsg && (
        <div style={{
          backgroundColor: '#E7F3DC',
          color: '#2D6A1E',
          padding: '14px 20px',
          borderRadius: '12px',
          fontWeight: 600,
          fontSize: '14px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #C0D6B4'
        }}>
          <Check size={18} color="var(--accent-green)" /> {actionSuccessMsg}
        </div>
      )}

      {/* Submissions Table */}
      <div className="faculty-table-card">
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
          Pending Student Submissions ({pendingSubmissions.length})
        </h2>

        {pendingSubmissions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
            <Check size={48} color="var(--accent-green)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>All Caught Up!</h3>
            <p style={{ fontSize: '14px', marginTop: '4px' }}>No student project proposals are currently waiting for faculty review.</p>
          </div>
        ) : (
          <table className="faculty-submissions-table">
            <thead>
              <tr className="faculty-table-head-row">
                <th className="faculty-th">Student Author</th>
                <th className="faculty-th">Project Proposal</th>
                <th className="faculty-th">Department</th>
                <th className="faculty-th">On-Site Document Preview</th>
                <th className="faculty-th">Submitted</th>
                <th className="faculty-th">Review Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingSubmissions.map(s => (
                <tr key={s.id} className="faculty-table-body-row">
                  <td className="faculty-td">
                    <div className="faculty-student-info">
                      <div 
                        className="faculty-student-avatar"
                        style={{ backgroundColor: s.studentAvatarBg || '#5FB245' }}
                      >
                        {s.studentName ? s.studentName.split(' ').map(n => n[0]).join('') : 'ST'}
                      </div>
                      <div>
                        <div className="faculty-student-name">{s.studentName}</div>
                        <div className="faculty-student-major">{s.studentMajor || 'Student Scholar'}</div>
                      </div>
                    </div>
                  </td>

                  <td className="faculty-td">
                    <div 
                      onClick={() => {
                        setSelectedSub(s);
                        setAllottedBudget(500);
                      }}
                      className="faculty-project-title-link"
                    >
                      {s.title}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Proposed Team: {s.proposedTeamSize || 4} members
                    </div>
                  </td>

                  <td className="faculty-td">
                    <span className="badge badge-green">{s.department}</span>
                  </td>

                  <td className="faculty-td">
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => openDocumentViewer(s, 'pdf')}
                        className="btn-outline"
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Read PDF Proposal on site"
                      >
                        <FileText size={12} color="var(--accent-green)" /> View PDF
                      </button>
                      <button
                        onClick={() => openDocumentViewer(s, 'ppt')}
                        className="btn-outline"
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        title="Preview Presentation Deck on site"
                      >
                        <Sparkles size={12} color="var(--accent-green)" /> View PPT
                      </button>
                    </div>
                  </td>

                  <td className="faculty-td" style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    {s.submittedDate || 'Recent'}
                  </td>

                  <td className="faculty-td">
                    <div className="faculty-actions-cell">
                      <button
                        onClick={() => {
                          setSelectedSub(s);
                          setAllottedBudget(500);
                        }}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                        title="Review and Allot Points"
                      >
                        <Award size={14} /> Review & Approve
                      </button>
                      <button
                        onClick={() => handleOpenFeedbackModal(s)}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626', borderColor: '#FCA5A5' }}
                        title="Request Revision with Feedback Text"
                      >
                        <MessageSquare size={14} /> Request Changes
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 1. Review & Point Allotment Modal */}
      {selectedSub && (
        <div className="auth-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setSelectedSub(null); }}>
          <div className="auth-modal-card animate-fade-in" style={{ width: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setSelectedSub(null)} className="auth-modal-close">✕</button>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <span className="badge badge-green">{selectedSub.department}</span>
              <span className="badge badge-dark">Assigned Mentor: {selectedSub.facultyMentor || 'Faculty Mentor'}</span>
            </div>

            <h2 className="font-serif" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              {selectedSub.title}
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Submitted by <strong>{selectedSub.studentName}</strong> ({selectedSub.studentMajor || 'Student Scholar'})
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px' }}>Project Abstract & Methodology</h4>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, backgroundColor: '#F9FAFB', padding: '16px', borderRadius: '12px' }}>
                {selectedSub.abstract}
              </p>
            </div>

            {/* Attached Documents Row with Click to View on Site */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div 
                onClick={() => openDocumentViewer(selectedSub, 'pdf')}
                style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: '#F9FAFB', transition: 'all 0.2s' }}
                title="Click to view PDF document on site"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <FileText size={22} color="var(--accent-green)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedSub.reportFileName || 'Proposal_Document.pdf'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>Click to Preview PDF on site</div>
                  </div>
                </div>
                <Eye size={18} color="var(--accent-green)" />
              </div>

              <div 
                onClick={() => openDocumentViewer(selectedSub, 'ppt')}
                style={{ border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: '#F9FAFB', transition: 'all 0.2s' }}
                title="Click to view Presentation deck on site"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <Sparkles size={22} color="var(--accent-green)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {selectedSub.presentationFileName || 'Pitch_Deck.pptx'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>Click to Preview PPT on site</div>
                  </div>
                </div>
                <Eye size={18} color="var(--accent-green)" />
              </div>
            </div>

            {/* Faculty Points Allotment Box */}
            <div style={{
              backgroundColor: '#12210F',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Award size={20} color="var(--accent-green)" />
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#FFFFFF' }}>
                  Allot Total Reward Points Budget for this Project
                </h4>
              </div>
              <p style={{ fontSize: '12px', color: '#A3B899', marginBottom: '14px', lineHeight: 1.4 }}>
                The student project owner will distribute points to recruited team members (Frontend, Backend, Design, etc.) from this allotted budget. Any remaining points will be automatically credited to the student who submitted the idea.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Total Project Budget:</label>
                <input
                  type="number"
                  min="200"
                  max="2000"
                  step="50"
                  value={allottedBudget}
                  onChange={(e) => setAllottedBudget(parseInt(e.target.value) || 500)}
                  style={{
                    width: '120px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--accent-green)',
                    backgroundColor: '#1D2E19',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    fontSize: '15px',
                    textAlign: 'right'
                  }}
                />
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-green)' }}>Points</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleOpenFeedbackModal(selectedSub)}
                className="btn-outline"
                style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
              >
                <AlertCircle size={16} /> Request Changes with Feedback
              </button>
              <button
                type="button"
                onClick={() => handleApproveClick(selectedSub.id, allottedBudget)}
                className="btn-primary"
              >
                <Check size={16} /> Approve & Allot {allottedBudget} Pts Budget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. REVISION FEEDBACK DIALOG (Higher Z-Index: 2500) */}
      {feedbackSub && (
        <div className="doc-viewer-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setFeedbackSub(null); }}>
          <div className="doc-viewer-modal-card animate-fade-in" style={{ width: '560px' }}>
            <button onClick={() => setFeedbackSub(null)} className="auth-modal-close">✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <AlertCircle size={22} color="#DC2626" />
              <h3 className="font-serif" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Request Revision from Student
              </h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Explain to <strong>{feedbackSub.studentName}</strong> what changes are needed before this project can be approved.
            </p>

            {feedbackError && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '14px' }}>
                {feedbackError}
              </div>
            )}

            <form onSubmit={handleSendFeedbackAndReject}>
              <div style={{ marginBottom: '16px' }}>
                <label className="auth-input-label">
                  Faculty Revision Guidance & Required Changes *
                </label>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g. Please clarify your machine learning model architecture, specify dataset sources, and adjust the proposed team roles."
                  className="submit-form-textarea"
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFeedbackSub(null)}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ backgroundColor: '#DC2626', border: 'none' }}
                >
                  <MessageSquare size={16} /> Send Feedback & Request Revision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ON-SITE IN-APP DOCUMENT / SLIDES VIEWER (Higher Z-Index: 2500 - Always on top) */}
      {docViewerData && (
        <div className="doc-viewer-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDocViewerData(null); }}>
          <div className="doc-viewer-modal-card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {docViewerData.docType === 'pdf' ? (
                  <FileText size={26} color="var(--accent-green)" />
                ) : (
                  <Sparkles size={26} color="var(--accent-green)" />
                )}
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                    {docViewerData.fileName}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Author: <strong>{docViewerData.sub.studentName}</strong> • Project: <strong>{docViewerData.sub.title}</strong>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {pdfBlobUrl && (
                  <button
                    onClick={() => window.open(pdfBlobUrl, '_blank')}
                    className="btn-outline"
                    style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    title="Open in new window"
                  >
                    <ExternalLink size={13} /> Fullscreen
                  </button>
                )}
                <button onClick={() => setDocViewerData(null)} className="auth-modal-close" style={{ position: 'static' }}>✕</button>
              </div>
            </div>

            {/* Document Viewer Container */}
            {docViewerData.docType === 'pdf' ? (
              <div>
                {pdfBlobUrl ? (
                  <div style={{ marginBottom: '16px' }}>
                    <object
                      data={pdfBlobUrl}
                      type="application/pdf"
                      className="doc-viewer-iframe"
                    >
                      <iframe
                        src={pdfBlobUrl}
                        title="PDF Document Viewer"
                        className="doc-viewer-iframe"
                      />
                    </object>
                  </div>
                ) : null}

                {/* Structured Interactive Document Reader View */}
                <div style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '24px',
                  maxHeight: '480px',
                  overflowY: 'auto'
                }}>
                  <div style={{ borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', marginBottom: '16px' }}>
                    <span className="badge badge-green" style={{ marginBottom: '8px', display: 'inline-block' }}>{docViewerData.sub.department}</span>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                      {docViewerData.sub.title}
                    </h2>
                    <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                      Lead Researcher: <strong>{docViewerData.sub.studentName}</strong> • Target Team Capacity: <strong>{docViewerData.sub.proposedTeamSize || 4} Members</strong>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>1. Executive Abstract</h4>
                    <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7 }}>
                      {docViewerData.sub.abstract || 'The proposed academic project provides an innovative methodology addressing challenges through cross-functional student teamwork.'}
                    </p>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>2. Technical Architecture & Required Skillset</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                      {docViewerData.sub.requiredSkills?.map(s => (
                        <span key={s} className="project-skill-tag" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>{s}</span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>3. Milestone Deliverables</h4>
                    <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#4B5563', lineHeight: 1.6 }}>
                      <li>Sprint 1: Research specifications and preliminary architecture verification.</li>
                      <li>Sprint 2: Core module implementation and student collaboration tasks.</li>
                      <li>Sprint 3: Final deployment, documentation review, and faculty demonstration.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              /* Interactive Slides Viewer for Presentation / PPT */
              <div>
                <div className="doc-viewer-slide-card">
                  <div>
                    <div style={{ fontSize: '12px', color: '#A3B899', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Slide {currentSlideIndex + 1} of 5 • {docViewerData.fileName}
                    </div>
                    <div className="doc-viewer-slide-title">
                      {currentSlideIndex === 0 && `🚀 ${docViewerData.sub.title}`}
                      {currentSlideIndex === 1 && `🎯 Problem Statement & Academic Innovation`}
                      {currentSlideIndex === 2 && `🛠️ Technical Architecture & Tools`}
                      {currentSlideIndex === 3 && `📅 Milestone Deliverables & Timeline Schedule`}
                      {currentSlideIndex === 4 && `🏆 Points Budget & Team Role Distribution`}
                    </div>
                    <div className="doc-viewer-slide-body">
                      {currentSlideIndex === 0 && (
                        <div>
                          <p style={{ marginBottom: '12px', fontSize: '15px' }}>{docViewerData.sub.abstract}</p>
                          <div style={{ marginTop: '16px', fontSize: '13px', color: 'var(--accent-green)' }}>
                            Department: <strong>{docViewerData.sub.department}</strong> | Proposed Team Size: <strong>{docViewerData.sub.proposedTeamSize || 4} Members</strong>
                          </div>
                        </div>
                      )}
                      {currentSlideIndex === 1 && (
                        <div>
                          <p>• Bridges real-world student engineering with verified academic mentorship.</p>
                          <p style={{ marginTop: '8px' }}>• Delivers scalable, tested software and research deliverables.</p>
                          <p style={{ marginTop: '8px' }}>• Ensures structured progress tracking across collaborative milestones.</p>
                        </div>
                      )}
                      {currentSlideIndex === 2 && (
                        <div>
                          <p>• Core Skills & Technologies:</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '12px 0' }}>
                            {docViewerData.sub.requiredSkills?.map(s => (
                              <span key={s} style={{ backgroundColor: 'rgba(95, 178, 69, 0.2)', color: 'var(--accent-green)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                                {s}
                              </span>
                            ))}
                          </div>
                          <p style={{ fontSize: '13px', color: '#9CA3AF' }}>• Cloud deployment, secure database design, and responsive client interfaces.</p>
                        </div>
                      )}
                      {currentSlideIndex === 3 && (
                        <div>
                          <p>• Sprint 1: Architecture blueprint and repository setup.</p>
                          <p style={{ marginTop: '8px' }}>• Sprint 2: Core modules, database migrations, and API integrations.</p>
                          <p style={{ marginTop: '8px' }}>• Sprint 3: End-to-end testing, documentation, and faculty review presentation.</p>
                        </div>
                      )}
                      {currentSlideIndex === 4 && (
                        <div>
                          <p>• Target Faculty Budget: <strong>500 Points</strong></p>
                          <p style={{ marginTop: '8px' }}>• Open Roles: Frontend, Backend, UI/UX Design, Database Engineer.</p>
                          <p style={{ marginTop: '8px' }}>• Remaining author share automatically credited upon deliverable verification.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
                    <button
                      disabled={currentSlideIndex === 0}
                      onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                      className="btn-outline"
                      style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', opacity: currentSlideIndex === 0 ? 0.4 : 1, padding: '6px 14px', fontSize: '12px' }}
                    >
                      <ChevronLeft size={14} /> Previous Slide
                    </button>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Slide {currentSlideIndex + 1} / 5</span>
                    <button
                      disabled={currentSlideIndex === 4}
                      onClick={() => setCurrentSlideIndex(prev => Math.min(4, prev + 1))}
                      className="btn-outline"
                      style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', opacity: currentSlideIndex === 4 ? 0.4 : 1, padding: '6px 14px', fontSize: '12px' }}
                    >
                      Next Slide <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Slide Quick-Jump Thumbnails */}
                <div className="doc-slide-thumb-strip">
                  {['1. Overview', '2. Goals', '3. Architecture', '4. Milestones', '5. Budget & Roles'].map((label, idx) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`doc-slide-thumb ${currentSlideIndex === idx ? 'active' : ''}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setDocViewerData(null)}
                className="btn-primary"
                style={{ padding: '8px 24px', fontSize: '13px' }}
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
