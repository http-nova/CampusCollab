import React, { useState } from 'react';
import { FileText, Sparkles, Check, Upload, CheckCircle2 } from 'lucide-react';
import './SubmitProjectModal.css';

export const SubmitProjectModal = ({
  isOpen,
  onClose,
  departments = [],
  facultyList = [],
  onSubmitProject
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(departments[0]?.name || 'Computer Science & AI');
  
  const defaultMentor = facultyList[0]?.name || 'Dr. Sarah Jenkins';
  const [facultyMentor, setFacultyMentor] = useState(defaultMentor);
  
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('React, Python, Machine Learning');
  
  // Real File Upload States
  const [reportFile, setReportFile] = useState(null);
  const [reportFileName, setReportFileName] = useState('');
  const [reportFileData, setReportFileData] = useState('');
  
  const [presentationFile, setPresentationFile] = useState(null);
  const [presentationFileName, setPresentationFileName] = useState('');
  const [presentationFileData, setPresentationFileData] = useState('');

  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const facultyOptions = facultyList.length > 0 ? facultyList : [
    { id: 'f1', name: 'Dr. Sarah Jenkins', department: 'Computer Science & AI' },
    { id: 'f2', name: 'Dr. Marcus Vance', department: 'Electrical Engineering' },
    { id: 'f3', name: 'Dr. Elena Rostova', department: 'Robotics & Automation' },
    { id: 'f4', name: 'Dr. David Chen', department: 'Data Science' }
  ];

  const handleReportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setReportFile(file);
      setReportFileName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setReportFileData(loadEvt.target?.result || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresentationFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPresentationFile(file);
      setPresentationFileName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setPresentationFileData(loadEvt.target?.result || '');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const skillsArray = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

    onSubmitProject({
      title,
      department,
      facultyMentor: facultyMentor || defaultMentor,
      description,
      requiredSkills: skillsArray,
      reportFileName: reportFileName || 'Proposal_Abstract.pdf',
      reportFileData: reportFileData || '',
      presentationFileName: presentationFileName || 'Project_Deck.pptx',
      presentationFileData: presentationFileData || '',
      maxTeamSize
    });

    setSubmittedSuccess(true);
    setTimeout(() => {
      setSubmittedSuccess(false);
      onClose();
      setTitle('');
      setDescription('');
      setReportFile(null);
      setReportFileName('');
      setReportFileData('');
      setPresentationFile(null);
      setPresentationFileName('');
      setPresentationFileData('');
    }, 1800);
  };

  return (
    <div className="submit-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="submit-modal-card animate-fade-in">
        <div className="submit-modal-header">
          <div>
            <h2 className="font-serif submit-modal-title">Submit Project Proposal</h2>
            <p className="submit-modal-subtitle">
              Submissions undergo faculty review before publishing onto the public board.
            </p>
          </div>
          <button onClick={onClose} className="submit-modal-close-btn">✕</button>
        </div>

        {submittedSuccess ? (
          <div className="submit-success-box">
            <Check size={52} className="submit-success-icon" />
            <h3 className="submit-success-title">Proposal Sent to Faculty!</h3>
            <p className="submit-success-desc">
              Earn +50 points once your assigned mentor ({facultyMentor || defaultMentor}) reviews and approves your proposal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="submit-project-form">
            <div>
              <label className="submit-form-label">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. AI-Powered Smart Campus Energy Grid"
                className="submit-form-input"
              />
            </div>

            <div className="submit-form-grid-2">
              <div>
                <label className="submit-form-label">
                  Academic Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="submit-form-select"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="submit-form-label">
                  Assigned Faculty Mentor *
                </label>
                <select
                  value={facultyMentor}
                  onChange={(e) => setFacultyMentor(e.target.value)}
                  className="submit-form-select"
                >
                  {facultyOptions.map(f => (
                    <option key={f.id || f.name} value={f.name}>
                      {f.name} ({f.department || 'Faculty Mentor'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="submit-form-grid-2">
              <div>
                <label className="submit-form-label">
                  Required Skills (Comma Separated)
                </label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, PyTorch, ROS2, Figma"
                  className="submit-form-input"
                />
              </div>

              <div>
                <label className="submit-form-label">
                  Max Team Capacity
                </label>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={maxTeamSize}
                  onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                  className="submit-form-input"
                />
              </div>
            </div>

            <div>
              <label className="submit-form-label">
                Project Description & Methodology *
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the research goals, technical architecture, and team responsibilities..."
                className="submit-form-textarea"
              />
            </div>

            <div>
              <label className="submit-form-label">
                Required Skills (Comma Separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="React, PyTorch, ROS2, Figma"
                className="submit-form-input"
              />
            </div>

            {/* REAL FILE ATTACHMENTS (PDF & PPT) */}
            <div>
              <label className="submit-form-label">
                Attach Project Proposal PDF & Presentation Deck
              </label>
              <div className="submit-attachment-grid">
                {/* 1. PDF Proposal Uploader */}
                <div className={`submit-attachment-box ${reportFileName ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleReportFileChange}
                    className="submit-hidden-file-input"
                    title="Upload PDF Document"
                  />
                  {reportFileName ? (
                    <CheckCircle2 size={26} color="var(--accent-green)" style={{ margin: '0 auto 6px' }} />
                  ) : (
                    <FileText size={26} className="submit-attachment-icon" />
                  )}
                  <div className="submit-attachment-title">
                    {reportFileName ? 'PDF Attached' : 'Attach PDF Proposal'}
                  </div>
                  <div className="submit-attachment-filename">
                    {reportFileName || 'Click to choose PDF (.pdf)'}
                  </div>
                  {!reportFileName && (
                    <div className="submit-attachment-hint">
                      Max size: 10MB
                    </div>
                  )}
                </div>

                {/* 2. PPT / Presentation Deck Uploader */}
                <div className={`submit-attachment-box ${presentationFileName ? 'has-file' : ''}`}>
                  <input
                    type="file"
                    accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handlePresentationFileChange}
                    className="submit-hidden-file-input"
                    title="Upload Presentation Slides"
                  />
                  {presentationFileName ? (
                    <CheckCircle2 size={26} color="var(--accent-green)" style={{ margin: '0 auto 6px' }} />
                  ) : (
                    <Sparkles size={26} className="submit-attachment-icon" />
                  )}
                  <div className="submit-attachment-title">
                    {presentationFileName ? 'Presentation Attached' : 'Attach Pitch Deck (PPT)'}
                  </div>
                  <div className="submit-attachment-filename">
                    {presentationFileName || 'Click to choose PPT (.pptx, .ppt)'}
                  </div>
                  {!presentationFileName && (
                    <div className="submit-attachment-hint">
                      Max size: 20MB
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="submit-modal-footer-btns">
              <button type="button" onClick={onClose} className="btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                <Upload size={16} /> Submit Proposal for Faculty Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
