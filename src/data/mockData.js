export const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: 'Computer Science', activeProjectsCount: 14, icon: 'Laptop' },
  { id: 'dept-2', name: 'Data Science & AI', activeProjectsCount: 9, icon: 'Brain' },
  { id: 'dept-3', name: 'Mechanical & Robotics', activeProjectsCount: 6, icon: 'Cpu' },
  { id: 'dept-4', name: 'Electrical Engineering', activeProjectsCount: 8, icon: 'Zap' },
  { id: 'dept-5', name: 'Biomedical Informatics', activeProjectsCount: 4, icon: 'Activity' },
  { id: 'dept-6', name: 'Business Analytics & Product', activeProjectsCount: 7, icon: 'TrendingUp' }
];

export const INITIAL_PROJECTS = [
  {
    id: 'proj-1',
    title: 'Autonomous Drone Navigation in GPS-Denied Environments',
    department: 'Mechanical & Robotics',
    categoryTag: 'Robotics & AI',
    facultyMentor: 'Dr. Marcus Vance',
    facultyAvatar: '/faculty_mentor.png',
    status: 'Approved',
    description: 'Developing multi-sensor visual-inertial odometry algorithms using ROS2 and stereo cameras to allow miniature quadcopters to navigate underground tunnels without GPS reception.',
    postedDate: '2 days ago',
    deadlineDate: '2026-09-30',
    daysRemaining: 18,
    ownerName: 'Alex Rivers',
    ownerAvatarBg: '#111827',
    requiredSkills: ['C++', 'ROS2', 'Computer Vision', 'PyTorch'],
    teamMembers: [
      { id: 'm-1', name: 'Alex Rivers', role: 'Perception Lead', avatar: 'AR', avatarBg: '#111827' },
      { id: 'm-2', name: 'Elena Rostova', role: 'Flight Control', avatar: 'ER', avatarBg: '#059669' },
      { id: 'm-3', name: 'Liam Chen', role: 'Hardware & CAD', avatar: 'LC', avatarBg: '#D97706' }
    ],
    maxTeamSize: 4,
    pointsReward: 150,
    progressPercent: 65,
    reportFileName: 'drone_navigation_proposal_v2.pdf',
    presentationFileName: 'drone_interim_presentation.pptx',
    applicationsCount: 4
  },
  {
    id: 'proj-2',
    title: 'Federated Learning Framework for Hospital Patient Records',
    department: 'Data Science & AI',
    categoryTag: 'Machine Learning',
    facultyMentor: 'Dr. Sarah Jenkins',
    facultyAvatar: '/faculty_mentor.png',
    status: 'Approved',
    description: 'Privacy-preserving decentralized AI model training architecture across four regional research hospitals without transferring sensitive patient clinical datasets.',
    postedDate: '4 days ago',
    deadlineDate: '2026-10-15',
    daysRemaining: 33,
    ownerName: 'Samantha Wu',
    ownerAvatarBg: '#2563EB',
    requiredSkills: ['Python', 'TensorFlow', 'Cryptography', 'Docker'],
    teamMembers: [
      { id: 'm-4', name: 'Samantha Wu', role: 'Research Lead', avatar: 'SW', avatarBg: '#2563EB' },
      { id: 'm-5', name: 'Tariq Al-Mansoor', role: 'Backend ML Engineer', avatar: 'TM', avatarBg: '#7C3AED' }
    ],
    maxTeamSize: 4,
    pointsReward: 200,
    progressPercent: 40,
    reportFileName: 'federated_learning_draft.pdf',
    presentationFileName: 'hospital_ai_slides.pptx',
    applicationsCount: 7
  },
  {
    id: 'proj-3',
    title: 'Smart Campus Microgrid & Solar Load Balancing Optimizer',
    department: 'Electrical Engineering',
    categoryTag: 'CleanTech & IoT',
    facultyMentor: 'Prof. David K. Miller',
    facultyAvatar: '/faculty_mentor.png',
    status: 'Approved',
    description: 'Deploying IoT energy meters across university dormitory halls to forecast energy peaks and autonomously balance solar battery distribution during peak kilowatt demand.',
    postedDate: '1 week ago',
    deadlineDate: '2026-11-01',
    daysRemaining: 50,
    ownerName: 'Jordan Taylor',
    ownerAvatarBg: '#059669',
    requiredSkills: ['Embedded C', 'MQTT', 'React', 'Time-Series Analysis'],
    teamMembers: [
      { id: 'm-6', name: 'Jordan Taylor', role: 'Project Owner', avatar: 'JT', avatarBg: '#059669' },
      { id: 'm-7', name: 'Chloe Dubois', role: 'Frontend Dashboard', avatar: 'CD', avatarBg: '#DB2777' },
      { id: 'm-8', name: 'Devon Patel', role: 'IoT Firmware', avatar: 'DP', avatarBg: '#4F46E5' }
    ],
    maxTeamSize: 5,
    pointsReward: 180,
    progressPercent: 55,
    reportFileName: 'campus_microgrid_specs.pdf',
    presentationFileName: 'solar_energy_sprint.pptx',
    applicationsCount: 2
  },
  {
    id: 'proj-4',
    title: 'Computer Vision Assistive Device for Visually Impaired Students',
    department: 'Computer Science',
    categoryTag: 'Accessibility & CV',
    facultyMentor: 'Dr. Sarah Jenkins',
    facultyAvatar: '/faculty_mentor.png',
    status: 'Approved',
    description: 'Wearable Raspberry Pi device with real-time text-to-speech OCR and indoor obstacle depth warning audio cues tailored for navigating campus libraries and dining facilities.',
    postedDate: '3 days ago',
    deadlineDate: '2026-10-20',
    daysRemaining: 38,
    ownerName: 'Maya Patel',
    ownerAvatarBg: '#D97706',
    requiredSkills: ['OpenCV', 'Python', 'Audio Processing', 'UI/UX'],
    teamMembers: [
      { id: 'm-9', name: 'Maya Patel', role: 'Lead Architect', avatar: 'MP', avatarBg: '#D97706' }
    ],
    maxTeamSize: 3,
    pointsReward: 160,
    progressPercent: 25,
    reportFileName: 'accessibility_wearable_scope.pdf',
    presentationFileName: 'cv_assistive_pitch.pptx',
    applicationsCount: 9
  }
];

export const INITIAL_FACULTY_SUBMISSIONS = [
  {
    id: 'sub-1',
    title: 'Automated Microfluidics DNA Sequencing Sensor',
    studentName: 'Julian Meyer',
    studentMajor: 'Biomedical Engineering (Junior)',
    studentAvatarBg: '#2563EB',
    department: 'Biomedical Informatics',
    submittedDate: 'Yesterday at 3:15 PM',
    abstract: 'A low-cost microfluidics chip prototype for rapid PCR amplification test verification in rural community clinics, utilizing capillary electrophoresis.',
    proposedTeamSize: 3,
    facultyMentor: 'Dr. Sarah Jenkins',
    reportFileName: 'microfluidics_proposal_full.pdf',
    presentationFileName: 'dna_sequencing_overview.pptx',
    status: 'Pending'
  },
  {
    id: 'sub-2',
    title: 'Campus Food Surplus Redistribution & Logistics Platform',
    studentName: 'Amina Nour',
    studentMajor: 'Business Analytics & CS (Senior)',
    studentAvatarBg: '#059669',
    department: 'Business Analytics & Product',
    submittedDate: 'Today at 9:30 AM',
    abstract: 'Real-time routing and alert system matching dining hall surplus meals with local student pantry distribution hubs to reduce campus food waste to zero.',
    proposedTeamSize: 4,
    facultyMentor: 'Prof. David K. Miller',
    reportFileName: 'food_pantry_logistics_plan.pdf',
    presentationFileName: 'sustainability_food_deck.pptx',
    status: 'Pending'
  },
  {
    id: 'sub-3',
    title: 'Quantum Key Distribution Simulation on Silicon Photonics',
    studentName: 'David Zhang',
    studentMajor: 'Physics & Computer Science (Senior)',
    studentAvatarBg: '#7C3AED',
    department: 'Computer Science',
    submittedDate: '3 days ago',
    abstract: 'Numerical simulation of BB84 protocol decoy-state implementation over fiber-optic waveguides using open-source Qiskit simulators.',
    proposedTeamSize: 2,
    facultyMentor: 'Dr. Marcus Vance',
    reportFileName: 'qkd_simulation_paper.pdf',
    presentationFileName: 'quantum_crypto_slides.pptx',
    status: 'Pending'
  }
];

export const INITIAL_MESSAGES = [
  {
    id: 'msg-1',
    projectId: 'proj-1',
    senderName: 'Dr. Marcus Vance',
    senderRole: 'Faculty',
    avatarBg: '#12210F',
    message: 'Great progress on the ROS2 camera calibration tests yesterday. Make sure to log the drift metrics before Thursday.',
    timestamp: 'Yesterday at 4:20 PM'
  },
  {
    id: 'msg-2',
    projectId: 'proj-1',
    senderName: 'Alex Rivers',
    senderRole: 'Student',
    avatarBg: '#111827',
    message: 'Thanks Dr. Vance! We just pushed the updated feature tracking node. Drift is down to 2.8cm per 10m traverse.',
    timestamp: 'Yesterday at 5:10 PM',
    attachmentName: 'drift_benchmarks_run3.csv'
  },
  {
    id: 'msg-3',
    projectId: 'proj-1',
    senderName: 'Elena Rostova',
    senderRole: 'Student',
    avatarBg: '#059669',
    message: 'I am integrating the optical flow backup mode tonight in case visual features drop below threshold.',
    timestamp: 'Today at 10:15 AM'
  },
  {
    id: 'msg-4',
    projectId: 'proj-2',
    senderName: 'Samantha Wu',
    senderRole: 'Student',
    avatarBg: '#2563EB',
    message: 'Initial differential privacy noise budget tests are complete. Checking with hospital IT for simulated endpoints.',
    timestamp: 'Yesterday at 2:00 PM'
  }
];

export const INITIAL_LEADERBOARD = [
  {
    id: 'lead-1',
    rank: 1,
    name: 'Samantha Wu',
    major: 'Data Science & AI',
    points: 1280,
    avatarBg: '#2563EB',
    projectsCompleted: 6,
    badges: ['Top Researcher', 'AI Pioneer', 'Team Captain']
  },
  {
    id: 'lead-2',
    rank: 2,
    name: 'Alex Rivers',
    major: 'Computer Science',
    points: 1140,
    avatarBg: '#111827',
    projectsCompleted: 5,
    badges: ['Lead Innovator', 'ROS Master', 'Quick Submitter']
  },
  {
    id: 'lead-3',
    rank: 3,
    name: 'Elena Rostova',
    major: 'Mechanical & Robotics',
    points: 980,
    avatarBg: '#059669',
    projectsCompleted: 4,
    badges: ['Hardware Ace', 'Milestone Champion']
  },
  {
    id: 'lead-4',
    rank: 4,
    name: 'Jordan Taylor',
    major: 'Electrical Engineering',
    points: 870,
    avatarBg: '#059669',
    projectsCompleted: 4,
    badges: ['CleanTech Pro', 'Team Collaborator']
  },
  {
    id: 'lead-5',
    rank: 5,
    name: 'Maya Patel',
    major: 'Computer Science',
    points: 790,
    avatarBg: '#D97706',
    projectsCompleted: 3,
    badges: ['Accessibility Advocate']
  }
];
