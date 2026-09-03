import React from 'react';
import { Trophy, Zap, Users, Sparkles, Award, ShieldCheck, CheckCircle2 } from 'lucide-react';
import './LeaderboardPage.css';

export const LeaderboardPage = ({ leaderboard, currentUser }) => {
  const topThree = leaderboard.slice(0, 3);
  const activeStudentName = currentUser ? currentUser.displayName : 'Student Scholar';

  return (
    <div className="container leaderboard-container animate-fade-in">
      <div className="leaderboard-header">
        <div className="leaderboard-header-tag">
          <Trophy size={16} /> Verified Academic Standings
        </div>

        <h1 className="font-serif leaderboard-title">
          Leaderboard & Reward Points
        </h1>
        <p className="leaderboard-subtitle">
          Points are automatically awarded by the system upon faculty review, project milestone approval, and verified cross-functional teamwork.
        </p>
      </div>

      {/* Official Automated Points Criteria Rules Card */}
      <div className="leaderboard-stats-row">
        <div className="stat-badge" style={{ backgroundColor: '#12210F', padding: '24px 20px' }}>
          <Sparkles size={28} color="var(--accent-green)" style={{ margin: '0 auto 10px' }} />
          <div className="stat-badge-number" style={{ color: '#FFFFFF', fontSize: '20px' }}>+50 Points</div>
          <div className="stat-badge-label" style={{ color: '#A3B899', fontSize: '13px', marginTop: '6px' }}>
            Faculty Proposal Approval
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Auto-awarded on faculty verification
          </div>
        </div>

        <div className="stat-badge" style={{ backgroundColor: 'var(--accent-green)', padding: '24px 20px' }}>
          <Zap size={28} color="#FFFFFF" style={{ margin: '0 auto 10px' }} />
          <div className="stat-badge-number" style={{ color: '#FFFFFF', fontSize: '20px' }}>+100 Points</div>
          <div className="stat-badge-label" style={{ color: '#FFFFFF', fontSize: '13px', marginTop: '6px' }}>
            Project Milestone Completion
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>
            Auto-awarded on deliverable approval
          </div>
        </div>

        <div className="stat-badge" style={{ backgroundColor: '#1D2E19', padding: '24px 20px' }}>
          <Users size={28} color="var(--accent-green)" style={{ margin: '0 auto 10px' }} />
          <div className="stat-badge-number" style={{ color: '#FFFFFF', fontSize: '20px' }}>+30 Points</div>
          <div className="stat-badge-label" style={{ color: '#A3B899', fontSize: '13px', marginTop: '6px' }}>
            Team Selection & Participation
          </div>
          <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
            Auto-awarded on joining project
          </div>
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1px solid #E5E7EB',
          padding: '60px 24px',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto'
        }}>
          <Award size={52} color="var(--accent-green)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            No Students Ranked Yet
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 16px', lineHeight: 1.6 }}>
            When students submit project proposals or complete milestones approved by faculty mentors, points will be automatically calculated and reflected live on this leaderboard.
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#E7F3DC', color: '#2D6A1E', padding: '6px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700 }}>
            <ShieldCheck size={14} /> Automatic Faculty Verification Active
          </div>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM CARDS */}
          <div className="leaderboard-podium-grid">
            {topThree[1] && (
              <div className="podium-card-silver">
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#6B7280', marginBottom: '12px' }}>RANK 2 • SILVER</div>
                <div 
                  className="podium-avatar-standard"
                  style={{ backgroundColor: topThree[1].avatarBg || '#5FB245' }}
                >
                  {topThree[1].name ? topThree[1].name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{topThree[1].name}</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{topThree[1].major}</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '12px' }}>
                  {topThree[1].points} pts
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                  {topThree[1].badges?.map(b => (
                    <span key={b} className="badge badge-green" style={{ fontSize: '11px' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            {topThree[0] && (
              <div className="podium-card-gold">
                <div className="podium-rank-badge-gold">
                  <Trophy size={18} color="var(--accent-green)" /> RANK 1 • GOLD CHAMPION
                </div>
                <div 
                  className="podium-avatar-gold"
                  style={{ backgroundColor: topThree[0].avatarBg || '#5FB245' }}
                >
                  {topThree[0].name ? topThree[0].name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{topThree[0].name}</h3>
                <div style={{ fontSize: '13px', color: '#2D6A1E', fontWeight: 600, marginBottom: '12px' }}>{topThree[0].major}</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--accent-green)', marginBottom: '12px' }}>
                  {topThree[0].points} pts
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  {topThree[0].badges?.map(b => (
                    <span key={b} className="badge badge-dark" style={{ fontSize: '11px' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}

            {topThree[2] && (
              <div className="podium-card-bronze">
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#6B7280', marginBottom: '12px' }}>RANK 3 • BRONZE</div>
                <div 
                  className="podium-avatar-standard"
                  style={{ backgroundColor: topThree[2].avatarBg || '#5FB245' }}
                >
                  {topThree[2].name ? topThree[2].name.split(' ').map(n => n[0]).join('') : 'U'}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{topThree[2].name}</h3>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{topThree[2].major}</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '12px' }}>
                  {topThree[2].points} pts
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                  {topThree[2].badges?.map(b => (
                    <span key={b} className="badge badge-green" style={{ fontSize: '11px' }}>{b}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STANDINGS TABLE */}
          <div className="leaderboard-table-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Campus Student Standings ({leaderboard.length})</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-Time Firestore Synchronized</span>
            </div>

            <table className="leaderboard-table">
              <thead>
                <tr style={{ borderBottom: '2px solid #F3F4F6', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <th className="leaderboard-th">Rank</th>
                  <th className="leaderboard-th">Student</th>
                  <th className="leaderboard-th">Major</th>
                  <th className="leaderboard-th">Completed Projects</th>
                  <th className="leaderboard-th">Badges Earned</th>
                  <th className="leaderboard-th" style={{ textAlign: 'right' }}>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map(s => {
                  const isCurrentUser = s.name === activeStudentName || s.name?.includes(activeStudentName);
                  return (
                    <tr key={s.id} style={{
                      borderBottom: '1px solid #F3F4F6',
                      fontSize: '14px',
                      backgroundColor: isCurrentUser ? '#E7F3DC' : 'transparent'
                    }}>
                      <td className="leaderboard-td" style={{ fontWeight: 800, color: s.rank <= 3 ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                        #{s.rank}
                      </td>
                      <td className="leaderboard-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: s.avatarBg || '#5FB245',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '13px'
                          }}>
                            {s.name ? s.name.split(' ').map(n => n[0]).join('') : 'U'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.name}</div>
                            {isCurrentUser && <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>(You)</span>}
                          </div>
                        </div>
                      </td>
                      <td className="leaderboard-td" style={{ color: 'var(--text-muted)' }}>{s.major || 'Academic Student'}</td>
                      <td className="leaderboard-td" style={{ fontWeight: 600 }}>{s.projectsCompleted || 0} Projects</td>
                      <td className="leaderboard-td">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {s.badges?.map(b => (
                            <span key={b} className="badge badge-green" style={{ fontSize: '11px' }}>{b}</span>
                          ))}
                        </div>
                      </td>
                      <td className="leaderboard-td" style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-green)', fontSize: '16px' }}>
                        {s.points} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
