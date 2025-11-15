import React from 'react';
import staffAnchorLogo from '../assets/StaffanchorLogoFinalSVG.svg';
import officePic01 from '../assets/officepic01.jpg';
import officePic02 from '../assets/officepic02.jpg';
import officePic03 from '../assets/officepic03.jpg';
import officePic04 from '../assets/officepic04.jpg';
import officePic05 from '../assets/officepic05.jpg';
import './LandingPage.css';

const LandingPage = () => (
  <div className="landing-page">
    {/* Hero Section */}
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <img src={staffAnchorLogo} className="hero-logo" alt="StaffAnchor Logo" />
          <h1 className="hero-title">The Future of Hiring is Here</h1>
          <p className="hero-subtitle">
            StaffAnchor ATS revolutionizes your recruitment process with intelligent candidate matching, 
            streamlined workflows, and data-driven insights that transform how you hire.
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">85%</span>
              <span className="stat-label">Faster Hiring</span>
            </div>
            <div className="stat">
              <span className="stat-number">92%</span>
              <span className="stat-label">Better Matches</span>
            </div>
            <div className="stat">
              <span className="stat-number">3x</span>
              <span className="stat-label">Productivity</span>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src={officePic01} alt="Modern Office" className="hero-img" />
        </div>
      </div>
    </section>

    {/* Features Section */}
    <section className="features-section">
      <div className="container">
        <h2 className="section-title">Why StaffAnchor ATS?</h2>
        <p className="section-subtitle">Built for modern teams who demand excellence</p>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Intelligent Matching</h3>
            <p>AI-powered candidate-job matching that finds the perfect fit based on skills, experience, and cultural alignment.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Lightning Fast</h3>
            <p>Process hundreds of applications in minutes, not hours. Get from posting to hiring in record time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Data-Driven Insights</h3>
            <p>Comprehensive analytics and reporting to optimize your hiring strategy and improve outcomes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Enterprise Security</h3>
            <p>Bank-level security with role-based access control ensuring your data stays protected.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Team Collaboration</h3>
            <p>Seamless collaboration between recruiters, hiring managers, and stakeholders.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Ready</h3>
            <p>Access your recruitment pipeline anywhere, anytime with our responsive mobile interface.</p>
          </div>
        </div>
      </div>
    </section>

    {/* How It Works Section */}
    <section className="how-it-works-section">
      <div className="container">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Simple, powerful, effective</p>
        
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Post Jobs</h3>
              <p>Create compelling job postings with our intuitive editor. Reach thousands of qualified candidates instantly.</p>
              <img src={officePic02} alt="Job Posting" className="step-image" />
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Screen Candidates</h3>
              <p>Our AI automatically screens and ranks candidates based on your requirements. Focus on the best matches.</p>
              <img src={officePic03} alt="Candidate Screening" className="step-image" />
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Hire Faster</h3>
              <p>Streamlined interview scheduling, feedback collection, and offer management. Close positions faster than ever.</p>
              <img src={officePic04} alt="Hiring Process" className="step-image" />
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Benefits Section */}
    <section className="benefits-section">
      <div className="container">
        <div className="benefits-content">
          <div className="benefits-text">
            <h2 className="section-title">Transform Your Hiring Process</h2>
            <p className="section-subtitle">Join thousands of companies who've revolutionized their recruitment</p>
            
            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">🚀</div>
                <div>
                  <h4>Reduce Time-to-Hire by 60%</h4>
                  <p>Automated workflows and intelligent matching cut hiring time dramatically.</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <div className="benefit-icon">💰</div>
                <div>
                  <h4>Save 40% on Hiring Costs</h4>
                  <p>Efficient processes and better candidate matching reduce recruitment expenses.</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <div className="benefit-icon">📈</div>
                <div>
                  <h4>Improve Quality of Hire</h4>
                  <p>Data-driven insights and AI matching ensure better candidate-job fit.</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <div className="benefit-icon">🎯</div>
                <div>
                  <h4>Enhance Candidate Experience</h4>
                  <p>Seamless application process and timely communication improve candidate satisfaction.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="benefits-image">
            <img src={officePic05} alt="Team Collaboration" className="benefits-img" />
          </div>
        </div>
      </div>
    </section>

    {/* Testimonials Section */}
    <section className="testimonials-section">
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>
        <p className="section-subtitle">Trusted by leading companies worldwide</p>
        
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"StaffAnchor ATS transformed our hiring process completely. We've reduced our time-to-hire by 70% and improved candidate quality significantly."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Sarah Johnson</h4>
                <span>HR Director, TechCorp</span>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The AI-powered matching is incredible. We're finding candidates we would have missed with traditional methods."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Michael Chen</h4>
                <span>Recruitment Manager, InnovateLab</span>
              </div>
            </div>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-content">
              <p>"The analytics and reporting features give us insights we never had before. Our hiring strategy is now data-driven."</p>
            </div>
            <div className="testimonial-author">
              <div className="author-info">
                <h4>Emily Rodriguez</h4>
                <span>Talent Acquisition Lead, GrowthStart</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="cta-section">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Hiring?</h2>
          <p className="cta-subtitle">Join thousands of companies already using StaffAnchor ATS to hire better, faster, and smarter.</p>
          <div className="cta-buttons">
            <button className="cta-button primary">Start Free Trial</button>
            <button className="cta-button secondary">Schedule Demo</button>
          </div>
          <p className="cta-note">No credit card required • 14-day free trial • Full access to all features</p>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <img src={staffAnchorLogo} alt="StaffAnchor" className="footer-logo" />
            <p>Empowering modern teams with intelligent recruitment solutions.</p>
          </div>
          
          <div className="footer-section">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="#integrations">Integrations</a></li>
              <li><a href="#security">Security</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Company</h4>
            <ul>
              <li><a href="#about">About</a></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#community">Community</a></li>
              <li><a href="#status">Status</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 StaffAnchor ATS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;
