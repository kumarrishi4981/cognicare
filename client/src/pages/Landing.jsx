import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShield, FiUsers, FiArrowRight } from 'react-icons/fi';
import './Landing.css';

const features = [
  {
    icon: '🖼️',
    title: 'Memory Lane',
    desc: 'Preserve precious memories through photos, audio recordings, and stories. Create a beautiful visual timeline that patients can revisit anytime to stay connected to their past.',
    iconClass: 'landing-feature-icon-blue',
  },
  {
    icon: '🎙️',
    title: 'Voice Routines',
    desc: 'Gentle, voice-guided daily routines that bring structure and comfort. Caregivers record familiar voices to guide patients through their day with warmth.',
    iconClass: 'landing-feature-icon-coral',
  },
  {
    icon: '👥',
    title: 'Care Coordination',
    desc: 'Keep your entire care team synchronized with real-time messaging, daily logs, mood tracking, and comprehensive health trend analysis.',
    iconClass: 'landing-feature-icon-green',
  },
  {
    icon: '🤖',
    title: 'AI Companion',
    desc: 'A compassionate AI chat companion that knows your loved one\'s story. It offers gentle conversation, reminders, and comfort — always patient, always kind.',
    iconClass: 'landing-feature-icon-purple',
  },
];

const stats = [
  { value: '50M+', label: 'People Affected' },
  { value: '24/7', label: 'Always Available' },
  { value: '4', label: 'Core Modules' },
  { value: '100%', label: 'Free Forever' },
];

const steps = [
  { number: 1, title: 'Create Account', desc: 'Sign up and choose your role — patient or caregiver.' },
  { number: 2, title: 'Connect', desc: 'Link patients and caregivers with a simple invite code.' },
  { number: 3, title: 'Care Together', desc: 'Start using all modules to enrich daily care.' },
];

export default function Landing() {
  const [navScrolled, setNavScrolled] = useState(false);
  const featureRefs = useRef([]);
  const [activeModal, setActiveModal] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', category: 'General Inquiry', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const handleContactChange = (e) => {
    setContactForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSubmitted(true);
      setContactForm({ name: '', email: '', category: 'General Inquiry', message: '' });
    }, 1000);
  };

  const closeModal = () => {
    setActiveModal(null);
    setContactSubmitted(false);
  };

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('landing-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    featureRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToFeatures = () => {
    document.getElementById('landing-features')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="landing-page">
      {/* ── Navigation ───────────────────────────────── */}
      <nav
        className={`landing-nav ${navScrolled ? 'landing-nav-scrolled' : ''}`}
        aria-label="Landing page navigation"
      >
        <Link to="/" className="landing-nav-brand" id="landing-nav-home">
          <FiHeart size={22} />
          CogniCare
        </Link>
        <div className="landing-nav-links">
          <button
            className="landing-nav-link"
            onClick={scrollToFeatures}
            id="landing-nav-features"
          >
            Features
          </button>
          <Link to="/login" className="landing-nav-link" id="landing-nav-login">
            Login
          </Link>
          <Link to="/register" className="btn btn-primary" id="landing-nav-register">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────── */}
      <section className="landing-hero" aria-label="Hero">
        {/* Floating decorative shapes */}
        <div className="landing-floating landing-floating-1" aria-hidden="true" />
        <div className="landing-floating landing-floating-2" aria-hidden="true" />
        <div className="landing-floating landing-floating-3" aria-hidden="true" />
        <div className="landing-floating landing-floating-4" aria-hidden="true" />
        <div className="landing-floating landing-floating-brain" aria-hidden="true">🧠</div>

        <div className="landing-hero-content animate-fadeInUp">
          <h1 className="landing-hero-title">
            Caring for the{' '}
            <span className="text-gradient">Mind</span>
          </h1>
          <p className="landing-hero-subtitle animate-fadeInUp delay-1">
            A compassionate ecosystem for dementia patients and their caregivers.
            Preserve memories. Build routines. Stay connected.
          </p>
          <div className="landing-hero-actions animate-fadeInUp delay-2">
            <Link to="/register" className="btn btn-primary btn-xl" id="landing-cta-register">
              Get Started <FiArrowRight />
            </Link>
            <button
              className="btn btn-secondary btn-xl"
              onClick={scrollToFeatures}
              id="landing-cta-learn"
            >
              Learn More
            </button>
          </div>
        </div>

        <div className="landing-stats animate-fadeIn delay-3">
          {stats.map((s) => (
            <div key={s.label} className="landing-stat">
              <div className="landing-stat-value">{s.value}</div>
              <div className="landing-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features Section ─────────────────────────── */}
      <section className="landing-features" id="landing-features" aria-label="Features">
        <div className="landing-section-header">
          <span className="landing-section-tag">Features</span>
          <h2 className="landing-section-title">Everything You Need</h2>
          <p className="landing-section-subtitle">
            Four powerful modules designed with empathy, built for simplicity, and crafted for impact.
          </p>
        </div>

        <div className="landing-features-grid">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="landing-feature-card card-glass"
              ref={(el) => (featureRefs.current[i] = el)}
              style={{ transitionDelay: `${i * 0.12}s` }}
            >
              <div className={`landing-feature-icon ${f.iconClass}`} aria-hidden="true">
                {f.icon}
              </div>
              <h3 className="landing-feature-title">{f.title}</h3>
              <p className="landing-feature-desc">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="landing-how" aria-label="How it works">
        <div className="landing-section-header">
          <span className="landing-section-tag">How It Works</span>
          <h2 className="landing-section-title">Three Simple Steps</h2>
          <p className="landing-section-subtitle">
            Get started in minutes. No technical expertise required.
          </p>
        </div>

        <div className="landing-steps">
          {steps.map((step) => (
            <div key={step.number} className="landing-step animate-fadeInUp">
              <div className="landing-step-number">{step.number}</div>
              {step.number < 3 && <div className="landing-step-connector" aria-hidden="true" />}
              <h3 className="landing-step-title">{step.title}</h3>
              <p className="landing-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Section ──────────────────────────────── */}
      <section className="landing-cta" aria-label="Call to action">
        <div className="landing-cta-content">
          <h2 className="landing-cta-title animate-fadeInUp">
            Ready to Make a Difference?
          </h2>
          <p className="landing-cta-text animate-fadeInUp delay-1">
            Join thousands of families using CogniCare to bring structure, comfort, and connection to their loved ones.
          </p>
          <Link
            to="/register"
            className="btn btn-xl animate-fadeInUp delay-2"
            id="landing-bottom-register"
          >
            Create Your Free Account <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="landing-footer" role="contentinfo">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <FiShield size={18} />
            <span className="landing-footer-logo">CogniCare</span>
          </div>
          <p className="landing-footer-copy">© 2026 CogniCare. All rights reserved.</p>
          <nav className="landing-footer-links" aria-label="Footer links">
            <button onClick={() => setActiveModal('privacy')} className="landing-footer-link" id="landing-link-privacy">Privacy</button>
            <button onClick={() => setActiveModal('terms')} className="landing-footer-link" id="landing-link-terms">Terms</button>
            <button onClick={() => setActiveModal('contact')} className="landing-footer-link" id="landing-link-contact">Contact</button>
          </nav>
        </div>
      </footer>

      {/* ── Privacy Policy Modal ───────────────────────── */}
      {activeModal === 'privacy' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content landing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Privacy Policy</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close modal">&times;</button>
            </div>
            <div className="landing-modal-body">
              <p className="landing-modal-update">Last updated: July 2026</p>
              
              <h3>1. Data Protection Commitment</h3>
              <p>At CogniCare, privacy is our highest priority, especially given the sensitive nature of cognitive health support. We implement strict security measures to protect you and your patient data.</p>
              
              <h3>2. Information We Collect</h3>
              <ul>
                <li><strong>Account details:</strong> Names, emails, and credentials for patients and caregivers.</li>
                <li><strong>Care Coordination Logs:</strong> Daily logs recording mood, sleep, medication adherence, and cognitive/physical notes.</li>
                <li><strong>Media Timeline:</strong> Uploaded memories (photos, stories, audio clips).</li>
                <li><strong>Routine Voice Notes:</strong> Voice recording files uploaded to assist patients with daily voice prompts.</li>
              </ul>
              
              <h3>3. How We Use and Share Data</h3>
              <p>Your data is strictly used to deliver CogniCare's services (e.g., streaming routine voice cues, rendering memory timelines, displaying care log trends). We never sell your personal information or share it with advertisers.</p>
              <p>Care logs and memory data are accessible only by the registered patient and their explicitly linked caregiver(s).</p>
              
              <h3>4. Security & Retention</h3>
              <p>All data is encrypted in transit and stored in secure cloud environments. You have the right to request deletion of your account and all associated patient records at any time by contacting our support team.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Terms of Service Modal ─────────────────────── */}
      {activeModal === 'terms' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content landing-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Terms of Service</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close modal">&times;</button>
            </div>
            <div className="landing-modal-body">
              <p className="landing-modal-update">Last updated: July 2026</p>
              
              <div className="landing-modal-alert">
                <strong>Medical Disclaimer:</strong> CogniCare is not a medical provider. The application is an organization and support ecosystem for dementia care. It is not a substitute for professional medical advice, diagnosis, or clinical treatment.
              </div>

              <h3>1. Description of Services</h3>
              <p>CogniCare provides an ecosystem designed for cognitive stimulation and care coordination, including memory timelines, voice-guided routines, care coordination logs, and an AI chat companion.</p>
              
              <h3>2. AI Companion Limits</h3>
              <p>The AI Companion is powered by advanced LLMs to provide gentle, warm, and repetitive-friendly chat support. While we optimize for safety and empathy, AI messages are conversational. Do not use the AI Companion as an authoritative source for medication prescriptions or medical advice.</p>
              
              <h3>3. User Responsibilities</h3>
              <p>Caregivers are responsible for obtaining patient consent for uploading memories and recording voices. You must secure the 6-character linking invite code to prevent unauthorized caregiver linking.</p>
              
              <h3>4. Acceptable Use</h3>
              <p>You agree not to abuse the system, upload malicious files, or use the platform to violate laws or infringe on personal privacy rights.</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact Modal ──────────────────────────────── */}
      {activeModal === 'contact' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content landing-modal landing-modal-contact" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Contact CogniCare</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close modal">&times;</button>
            </div>
            <div className="landing-modal-body">
              {contactSubmitted ? (
                <div className="contact-success animate-scaleIn">
                  <div className="contact-success-icon">✓</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. A support coordinator will respond to your inquiry via email within 24 hours.</p>
                  <button className="btn btn-primary" onClick={closeModal} style={{ marginTop: '1.5rem' }}>Close</button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  <p className="contact-intro">Have questions, feedback, or need technical help? Send us a message and we'll get right back to you.</p>
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="contact-name">Your Name</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      className="form-input"
                      required
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="contact-email">Email Address</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      className="form-input"
                      required
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="contact-category">Subject / Category</label>
                    <select
                      id="contact-category"
                      name="category"
                      className="form-input"
                      value={contactForm.category}
                      onChange={handleContactChange}
                      style={{ appearance: 'auto' }}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Tech Support">Technical Support</option>
                      <option value="Feedback">Feedback / Suggestions</option>
                    </select>
                  </div>
                  
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label" htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      className="form-input form-textarea"
                      required
                      rows="4"
                      value={contactForm.message}
                      onChange={handleContactChange}
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <button type="submit" className="btn btn-primary" disabled={contactLoading} style={{ width: '100%', marginTop: '0.5rem' }}>
                    {contactLoading ? 'Sending...' : 'Send Message'}
                  </button>

                  <div className="contact-info-block">
                    <h4>Direct Support</h4>
                    <p><strong>Email:</strong> support@cognicare.org</p>
                    <p><strong>Phone:</strong> +1 (800) 555-0199 (24/7 Helpline)</p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
