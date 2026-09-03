import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { db, auth, isFirebaseConfigured } from '../config/firebase';

const LOCAL_STORAGE_KEY_PROJECTS = 'campuscollab_projects';
const LOCAL_STORAGE_KEY_SUBMISSIONS = 'campuscollab_submissions';
const LOCAL_STORAGE_KEY_MESSAGES = 'campuscollab_messages';
const LOCAL_STORAGE_KEY_LEADERBOARD = 'campuscollab_leaderboard';
const LOCAL_STORAGE_KEY_USER = 'campuscollab_user';
const LOCAL_STORAGE_KEY_FACULTY = 'campuscollab_faculty_list';

const getStoredLocalData = (key, defaultData) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultData;
  } catch {
    return defaultData;
  }
};

const setStoredLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

// Dispatch custom event for immediate multi-component state updates
const notifyAuthUpdate = (user) => {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
  }
  window.dispatchEvent(new CustomEvent('campuscollab_auth_change', { detail: user }));
};

// ==================== AUTHENTICATION ====================

// Public signup is strictly for Students only
export const signupUser = async (email, pass, name) => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please enter your Firebase configuration.');
  }

  try {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      try {
        await updateProfile(res.user, { displayName: name });
      } catch (e) {
        console.warn('Profile update warning:', e);
      }
    }
    const profile = {
      uid: res.user.uid,
      email,
      displayName: name || email.split('@')[0],
      role: 'Student',
      points: 0,
      avatarBg: '#5FB245'
    };
    
    // Background cloud sync
    setTimeout(async () => {
      try {
        await setDoc(doc(db, 'users', res.user.uid), profile);
        await setDoc(doc(db, 'leaderboard', res.user.uid), {
          id: res.user.uid,
          name: profile.displayName,
          major: 'Academic Student',
          points: 0,
          avatarBg: '#5FB245',
          projectsCompleted: 0,
          badges: ['Registered Student']
        });
      } catch (fsErr) {
        console.warn('Firestore write skipped in background:', fsErr);
      }
    }, 0);

    notifyAuthUpdate(profile);
    return profile;
  } catch (err) {
    console.error('Firebase signup error:', err);
    throw err;
  }
};

export const loginUser = async (email, pass) => {
  const cleanEmail = (email || '').toLowerCase().trim();

  // Check if email matches a provisioned faculty account
  const facultyDirectory = getStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, []);
  const matchedFaculty = facultyDirectory.find(f => f.email?.toLowerCase().trim() === cleanEmail);

  // If faculty account was provisioned in Admin Panel with a specific initial password
  if (matchedFaculty && matchedFaculty.password && pass === matchedFaculty.password) {
    const facultyProfile = {
      uid: matchedFaculty.id || `fac-${cleanEmail}`,
      email: cleanEmail,
      displayName: matchedFaculty.name || matchedFaculty.displayName || 'Faculty Mentor',
      role: 'Faculty',
      department: matchedFaculty.department || 'Computer Science & AI',
      title: matchedFaculty.title || 'Faculty Mentor',
      points: 0,
      avatarBg: '#12210F'
    };
    notifyAuthUpdate(facultyProfile);
    return facultyProfile;
  }

  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please enter your Firebase configuration.');
  }

  try {
    const res = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    const isFacultyAccount = Boolean(matchedFaculty) || cleanEmail.includes('faculty') || cleanEmail.includes('prof') || cleanEmail.includes('dr.');
    
    let profile = {
      uid: res.user.uid,
      email: res.user.email || cleanEmail,
      displayName: res.user.displayName || (matchedFaculty?.name) || cleanEmail.split('@')[0],
      role: isFacultyAccount ? 'Faculty' : 'Student',
      points: 0,
      avatarBg: isFacultyAccount ? '#12210F' : '#5FB245'
    };

    // Fast return, background user doc sync
    setTimeout(async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', res.user.uid));
        if (userDoc.exists()) {
          const docData = userDoc.data();
          notifyAuthUpdate({ ...profile, ...docData, role: docData.role || profile.role });
        } else {
          await setDoc(doc(db, 'users', res.user.uid), profile);
        }
      } catch (e) {
        console.warn('Firestore doc read skipped during login:', e);
      }
    }, 0);

    notifyAuthUpdate(profile);
    return profile;
  } catch (err) {
    console.error('Firebase login error:', err);
    throw err;
  }
};

export const loginWithGoogle = async () => {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please connect Firebase in settings.');
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  let res;
  try {
    res = await signInWithPopup(auth, provider);
  } catch (popupErr) {
    console.error('Firebase Google Sign-In popup error:', popupErr);
    throw popupErr;
  }

  const cleanEmail = (res.user.email || '').toLowerCase().trim();
  const facultyDirectory = getStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, []);
  const isFaculty = facultyDirectory.some(f => f.email?.toLowerCase().trim() === cleanEmail);

  const profile = {
    uid: res.user.uid,
    email: cleanEmail,
    displayName: res.user.displayName || cleanEmail.split('@')[0] || 'Google Scholar',
    role: isFaculty ? 'Faculty' : 'Student',
    points: 0,
    avatarBg: isFaculty ? '#12210F' : '#5FB245'
  };

  // Fast return, background user document sync to avoid popup delay
  setTimeout(async () => {
    try {
      const userDocRef = doc(db, 'users', res.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const cloudData = userDoc.data();
        notifyAuthUpdate({ ...profile, ...cloudData, role: cloudData.role || profile.role });
      } else {
        await setDoc(userDocRef, profile);
        if (!isFaculty) {
          await setDoc(doc(db, 'leaderboard', res.user.uid), {
            id: res.user.uid,
            name: profile.displayName,
            major: 'Academic Student',
            points: 0,
            avatarBg: '#5FB245',
            projectsCompleted: 0,
            badges: ['Google Scholar']
          });
        }
      }
    } catch (firestoreErr) {
      console.warn('Firestore background sync skipped:', firestoreErr);
    }
  }, 0);

  notifyAuthUpdate(profile);
  return profile;
};

export const logoutUser = async () => {
  if (isFirebaseConfigured) {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY_USER);
  notifyAuthUpdate(null);
};

export const listenToAuthChanges = (callback) => {
  // Emit saved local user session immediately to prevent sign-out on refresh/tab close
  const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
  if (localSaved) {
    try {
      callback(JSON.parse(localSaved));
    } catch {
      // ignore
    }
  }

  const handleCustomAuth = (e) => {
    callback(e.detail || null);
  };
  window.addEventListener('campuscollab_auth_change', handleCustomAuth);

  let fbUnsub = () => {};

  if (isFirebaseConfigured) {
    fbUnsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const cleanEmail = (fbUser.email || '').toLowerCase().trim();
        const facultyDirectory = getStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, []);
        const isFaculty = facultyDirectory.some(f => f.email?.toLowerCase().trim() === cleanEmail);

        let profile = {
          uid: fbUser.uid,
          email: cleanEmail,
          displayName: fbUser.displayName || cleanEmail.split('@')[0] || 'Scholar',
          role: isFaculty ? 'Faculty' : 'Student',
          points: 0,
          avatarBg: isFaculty ? '#12210F' : '#5FB245'
        };

        try {
          const docSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (docSnap.exists()) {
            profile = { ...profile, ...docSnap.data() };
          }
        } catch (e) {
          console.warn('Firestore doc read skipped during auth change:', e);
        }

        notifyAuthUpdate(profile);
        callback(profile);
      } else {
        const currentLocal = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
        if (!currentLocal) {
          callback(null);
        }
      }
    });
  }

  return () => {
    window.removeEventListener('campuscollab_auth_change', handleCustomAuth);
    fbUnsub();
  };
};

// ==================== FACULTY PROVISIONING (ADMIN ONLY) ====================

export const createFacultyAccount = async (facultyData) => {
  const newFaculty = {
    id: `fac-${Date.now()}`,
    name: facultyData.name,
    displayName: facultyData.name,
    email: facultyData.email.toLowerCase().trim(),
    department: facultyData.department || 'Computer Science & AI',
    title: facultyData.title || 'Faculty Mentor',
    role: 'Faculty',
    showOnHome: facultyData.showOnHome !== undefined ? facultyData.showOnHome : true,
    password: facultyData.password || 'Faculty@2026',
    avatarBg: '#12210F',
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  const currentFaculty = getStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, [
    {
      id: 'fac-jenkins',
      name: 'Dr. Sarah Jenkins',
      displayName: 'Dr. Sarah Jenkins',
      email: 'dr.jenkins@university.edu',
      department: 'Computer Science & AI',
      title: 'Professor & Department Chair',
      role: 'Faculty',
      showOnHome: true,
      password: 'Faculty@2026',
      avatarBg: '#12210F',
      createdAt: 'Aug 15, 2026'
    }
  ]);
  
  const updated = [newFaculty, ...currentFaculty.filter(f => f.email !== newFaculty.email)];
  setStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, updated);
  window.dispatchEvent(new CustomEvent('campuscollab_faculty_change', { detail: updated }));

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'faculty', newFaculty.id), newFaculty);
      await setDoc(doc(db, 'users', newFaculty.id), {
        uid: newFaculty.id,
        displayName: newFaculty.name,
        email: newFaculty.email,
        role: 'Faculty',
        points: 0,
        department: newFaculty.department,
        title: newFaculty.title,
        showOnHome: newFaculty.showOnHome,
        avatarBg: '#12210F'
      });
    } catch (e) {
      console.warn('Firestore faculty account write fallback:', e);
    }
  }

  return newFaculty;
};

export const updateFacultyAccount = async (facultyId, updateData) => {
  const currentFaculty = getStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, []);
  const updated = currentFaculty.map(f => f.id === facultyId ? { ...f, ...updateData } : f);
  setStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, updated);
  window.dispatchEvent(new CustomEvent('campuscollab_faculty_change', { detail: updated }));

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'faculty', facultyId), updateData);
    } catch (e) {
      console.warn('Firestore update faculty fallback:', e);
    }
  }
  return updated;
};

export const subscribeToFacultyList = (callback) => {
  const initial = getStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, [
    {
      id: 'fac-jenkins',
      name: 'Dr. Sarah Jenkins',
      displayName: 'Dr. Sarah Jenkins',
      email: 'dr.jenkins@university.edu',
      department: 'Computer Science & AI',
      title: 'Professor & Department Chair',
      role: 'Faculty',
      showOnHome: true,
      password: 'Faculty@2026',
      avatarBg: '#12210F',
      createdAt: 'Aug 15, 2026'
    }
  ]);
  callback(initial);

  const handleCustomSync = (e) => {
    callback(e.detail || getStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, []));
  };
  window.addEventListener('campuscollab_faculty_change', handleCustomSync);

  let fbUnsub = () => {};

  if (isFirebaseConfigured) {
    try {
      fbUnsub = onSnapshot(collection(db, 'faculty'), (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          setStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, data);
          callback(data);
        }
      }, (err) => {
        console.warn('Firestore faculty listener fallback:', err);
      });
    } catch (e) {
      console.warn('Firestore query error:', e);
    }
  }

  return () => {
    window.removeEventListener('campuscollab_faculty_change', handleCustomSync);
    fbUnsub();
  };
};

export const deleteFacultyAccount = async (facultyId) => {
  const currentFaculty = getStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, []);
  const updated = currentFaculty.filter(f => f.id !== facultyId);
  setStoredLocalData(LOCAL_STORAGE_KEY_FACULTY, updated);
  window.dispatchEvent(new CustomEvent('campuscollab_faculty_change', { detail: updated }));

  if (isFirebaseConfigured) {
    try {
      await deleteDoc(doc(db, 'faculty', facultyId));
    } catch (e) {
      console.warn('Firestore delete faculty fallback:', e);
    }
  }
  return updated;
};

// ==================== REALTIME FIRESTORE PROJECTS ====================

export const subscribeToApprovedProjects = (callback) => {
  const initialLocal = getStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, []);
  callback(initialLocal);

  const handleCustomSync = (e) => {
    callback(e.detail || getStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, []));
  };
  window.addEventListener('campuscollab_projects_change', handleCustomSync);

  let fbUnsub = () => {};

  if (isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'projects'), where('status', '==', 'Approved'));
      fbUnsub = onSnapshot(q, (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const localData = getStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, []);
          const merged = [...data];
          localData.forEach(lp => {
            if (!merged.some(m => m.id === lp.id)) {
              merged.push(lp);
            }
          });
          setStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, merged);
          callback(merged);
        } else {
          callback(getStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, []));
        }
      }, (err) => {
        console.warn('Firestore projects listener fallback:', err);
        callback(getStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, []));
      });
    } catch (e) {
      console.warn('Firestore query error:', e);
      callback(getStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, []));
    }
  }

  return () => {
    window.removeEventListener('campuscollab_projects_change', handleCustomSync);
    fbUnsub();
  };
};

export const saveProject = async (project) => {
  const current = getStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, []);
  const updated = [project, ...current.filter(p => p.id !== project.id)];
  setStoredLocalData(LOCAL_STORAGE_KEY_PROJECTS, updated);
  window.dispatchEvent(new CustomEvent('campuscollab_projects_change', { detail: updated }));

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'projects', project.id), {
        ...project,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore saveProject fallback to local storage:', e);
    }
  }
  return updated;
};

// ==================== REALTIME FACULTY SUBMISSIONS ====================

export const subscribeToFacultySubmissions = (callback) => {
  const initialLocal = getStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, []);
  callback(initialLocal);

  const handleCustomSync = (e) => {
    callback(e.detail || getStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, []));
  };
  window.addEventListener('campuscollab_submissions_change', handleCustomSync);

  let fbUnsub = () => {};

  if (isFirebaseConfigured) {
    try {
      fbUnsub = onSnapshot(collection(db, 'submissions'), (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const localSubs = getStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, []);
          const merged = [...data];
          localSubs.forEach(ls => {
            if (!merged.some(m => m.id === ls.id)) {
              merged.push(ls);
            }
          });
          setStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, merged);
          callback(merged);
        } else {
          callback(getStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, []));
        }
      }, (err) => {
        console.warn('Firestore submissions listener fallback:', err);
        callback(getStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, []));
      });
    } catch (e) {
      console.warn('Firestore submissions query error:', e);
      callback(getStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, []));
    }
  }

  return () => {
    window.removeEventListener('campuscollab_submissions_change', handleCustomSync);
    fbUnsub();
  };
};

export const saveSubmission = async (sub) => {
  const current = getStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, []);
  const updated = [sub, ...current.filter(s => s.id !== sub.id)];
  setStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, updated);
  window.dispatchEvent(new CustomEvent('campuscollab_submissions_change', { detail: updated }));

  if (isFirebaseConfigured) {
    try {
      await setDoc(doc(db, 'submissions', sub.id), sub);
    } catch (e) {
      console.warn('Firestore saveSubmission fallback to local storage:', e);
    }
  }
  return updated;
};

export const updateSubmissionStatus = async (submissionId, status, feedbackData = {}) => {
  const current = getStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, []);
  const updated = current.map(s => s.id === submissionId ? { 
    ...s, 
    status,
    feedback: feedbackData.feedback !== undefined ? feedbackData.feedback : s.feedback,
    feedbackDate: feedbackData.feedbackDate || (feedbackData.feedback ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : s.feedbackDate),
    feedbackAuthor: feedbackData.feedbackAuthor || s.feedbackAuthor
  } : s);
  setStoredLocalData(LOCAL_STORAGE_KEY_SUBMISSIONS, updated);
  window.dispatchEvent(new CustomEvent('campuscollab_submissions_change', { detail: updated }));

  if (isFirebaseConfigured) {
    try {
      await updateDoc(doc(db, 'submissions', submissionId), { 
        status,
        ...(feedbackData.feedback ? {
          feedback: feedbackData.feedback,
          feedbackDate: feedbackData.feedbackDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          feedbackAuthor: feedbackData.feedbackAuthor || 'Faculty Mentor'
        } : {})
      });
    } catch (e) {
      console.warn('Firestore updateSubmissionStatus fallback:', e);
    }
  }
  return updated;
};

// ==================== REALTIME CHAT ====================

export const subscribeToChatMessages = (callback) => {
  const initialLocal = getStoredLocalData(LOCAL_STORAGE_KEY_MESSAGES, []);
  callback(initialLocal);

  const handleCustomSync = (e) => {
    const allMsgs = e.detail || getStoredLocalData(LOCAL_STORAGE_KEY_MESSAGES, []);
    callback(allMsgs);
  };
  window.addEventListener('campuscollab_messages_change', handleCustomSync);

  let fbUnsub = () => {};

  if (isFirebaseConfigured) {
    try {
      fbUnsub = onSnapshot(collection(db, 'messages'), (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          data.sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
          setStoredLocalData(LOCAL_STORAGE_KEY_MESSAGES, data);
          callback(data);
        } else {
          callback(getStoredLocalData(LOCAL_STORAGE_KEY_MESSAGES, []));
        }
      }, (err) => {
        console.warn('Firestore chat listener fallback:', err);
        callback(getStoredLocalData(LOCAL_STORAGE_KEY_MESSAGES, []));
      });
    } catch (e) {
      console.warn('Firestore chat query error:', e);
      callback(getStoredLocalData(LOCAL_STORAGE_KEY_MESSAGES, []));
    }
  }

  return () => {
    window.removeEventListener('campuscollab_messages_change', handleCustomSync);
    fbUnsub();
  };
};

export const sendChatMessage = async (msg) => {
  const current = getStoredLocalData(LOCAL_STORAGE_KEY_MESSAGES, []);
  const updated = [...current, msg];
  setStoredLocalData(LOCAL_STORAGE_KEY_MESSAGES, updated);
  window.dispatchEvent(new CustomEvent('campuscollab_messages_change', { detail: updated }));

  if (isFirebaseConfigured) {
    try {
      await addDoc(collection(db, 'messages'), {
        ...msg,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.warn('Firestore sendChatMessage fallback:', e);
    }
  }
  return updated;
};

// ==================== REALTIME LEADERBOARD ====================

export const subscribeToLeaderboard = (callback) => {
  const initialLocal = getStoredLocalData(LOCAL_STORAGE_KEY_LEADERBOARD, []);
  callback(initialLocal);

  const handleCustomSync = (e) => {
    callback(e.detail || getStoredLocalData(LOCAL_STORAGE_KEY_LEADERBOARD, []));
  };
  window.addEventListener('campuscollab_leaderboard_change', handleCustomSync);

  let fbUnsub = () => {};

  if (isFirebaseConfigured) {
    try {
      fbUnsub = onSnapshot(collection(db, 'leaderboard'), async (snap) => {
        if (!snap.empty) {
          const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          data.sort((a, b) => (b.points || 0) - (a.points || 0));
          const ranked = data.map((item, idx) => ({ ...item, rank: idx + 1 }));
          setStoredLocalData(LOCAL_STORAGE_KEY_LEADERBOARD, ranked);
          callback(ranked);
        } else {
          callback(getStoredLocalData(LOCAL_STORAGE_KEY_LEADERBOARD, []));
        }
      }, (err) => {
        console.warn('Firestore leaderboard listener fallback:', err);
        callback(getStoredLocalData(LOCAL_STORAGE_KEY_LEADERBOARD, []));
      });
    } catch (e) {
      console.warn('Firestore leaderboard query error:', e);
      callback(getStoredLocalData(LOCAL_STORAGE_KEY_LEADERBOARD, []));
    }
  }

  return () => {
    window.removeEventListener('campuscollab_leaderboard_change', handleCustomSync);
    fbUnsub();
  };
};

export const addLeaderboardPoints = async (studentName, pointsToAdd, milestoneName = 'Milestone Deliverable') => {
  const current = getStoredLocalData(LOCAL_STORAGE_KEY_LEADERBOARD, []);
  let found = false;
  let updated = current.map(s => {
    if (s.name === studentName || (studentName.includes('Alex') && s.name.includes('Alex'))) {
      found = true;
      return {
        ...s,
        points: (s.points || 0) + pointsToAdd,
        projectsCompleted: (s.projectsCompleted || 0) + 1,
        badges: Array.from(new Set([...(s.badges || []), milestoneName]))
      };
    }
    return s;
  });

  if (!found) {
    updated.push({
      id: `usr-${Date.now()}`,
      name: studentName,
      major: 'Academic Student',
      points: pointsToAdd,
      avatarBg: '#5FB245',
      projectsCompleted: 1,
      badges: [milestoneName]
    });
  }

  updated.sort((a, b) => b.points - a.points);
  updated = updated.map((item, idx) => ({ ...item, rank: idx + 1 }));
  setStoredLocalData(LOCAL_STORAGE_KEY_LEADERBOARD, updated);
  window.dispatchEvent(new CustomEvent('campuscollab_leaderboard_change', { detail: updated }));

  // Update current user profile points in localStorage and dispatch event
  const currentUsr = getStoredLocalData(LOCAL_STORAGE_KEY_USER, null);
  if (currentUsr && (currentUsr.displayName === studentName || currentUsr.email === studentName)) {
    const updatedUsr = { ...currentUsr, points: (currentUsr.points || 0) + pointsToAdd };
    notifyAuthUpdate(updatedUsr);
  }

  if (isFirebaseConfigured) {
    try {
      const match = updated.find(s => s.name === studentName);
      if (match) {
        await setDoc(doc(db, 'leaderboard', match.id), match);
      }
    } catch (e) {
      console.warn('Firestore addLeaderboardPoints fallback:', e);
    }
  }

  return updated;
};
