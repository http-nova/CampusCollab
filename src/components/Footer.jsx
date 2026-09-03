import React from 'react';
import { Heart } from 'lucide-react';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="footer-main">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">
              <span className="font-serif footer-logo-text">
                CampusCollab
              </span>
            </div>
            <p className="footer-tagline">
              Empowering student innovation and faculty mentorship through collaborative research, peer recruitment, and reward-backed academic milestones.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Explore</h4>
            <ul className="footer-nav-list">
              <li><a href="#" className="footer-nav-link">Browse All Projects</a></li>
              <li><a href="#" className="footer-nav-link">Faculty Approval Portal</a></li>
              <li><a href="#" className="footer-nav-link">Leaderboard & Rewards</a></li>
              <li><a href="#" className="footer-nav-link">Research Departments</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Departments</h4>
            <ul className="footer-nav-list">
              <li><a href="#" className="footer-nav-link">Computer Science</a></li>
              <li><a href="#" className="footer-nav-link">Data Science & AI</a></li>
              <li><a href="#" className="footer-nav-link">Robotics & Engineering</a></li>
              <li><a href="#" className="footer-nav-link">Business & Product</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Campus Stats</h4>
            <div className="footer-stats-list">
              <div>
                <span className="footer-stat-number">1,200+</span>
                <span>Projects Submitted</span>
              </div>
              <div>
                <span className="footer-stat-white">5,000+</span>
                <span>Active Students</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div>© 2026 CampusCollab Academic Platform. All rights reserved.</div>
          <div className="footer-made-with">
            Built for Academic Excellence <Heart size={14} color="var(--accent-green)" fill="var(--accent-green)" />
          </div>
        </div>
      </div>
    </footer>
  );
};
