import React from 'react';

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.98-1.98a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function ContactPage() {
  // All contact info is static - no API calls
  const contactInfo = [
    { icon: <MapPinIcon />, label: 'Our Office', value: 'Ushuru Pension Plaza\nNairobi, Kenya' },
    { icon: <PhoneIcon />, label: 'Phone', value: '+254 7123654789\n+254 7123456789' },
    { icon: <MailIcon />, label: 'Email', value: 'investor@nf-holding.com' },
    { icon: <ClockIcon />, label: 'Business Hours', value: 'Monday – Friday\n8:00 AM – 5:00 PM EAT' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=DM+Serif+Display:ital@0;1&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .contact-page {
          font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #f8f7f5;
          min-height: 100vh;
          color: #1a1814;
        }

        .hero {
          position: relative;
          height: 400px;
          overflow: hidden;
        }
        @media (min-width: 768px) { .hero { height: 450px; } }

        .hero-image {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.6) 100%);
        }
        .hero-inner {
          position: relative; z-index: 10;
          display: grid; width: 100%; height: 100%;
          grid-template-columns: repeat(12, 1fr);
          max-width: 1920px; margin: 0 auto;
        }
        .hero-spacer { display: none; }
        @media (min-width: 1024px) { .hero-spacer { display: block; grid-column: span 1; } }
        .hero-content {
          grid-column: 1 / -1;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 0 24px 60px;
        }
        @media (min-width: 640px) { .hero-content { padding: 0 28px 70px; } }
        @media (min-width: 1024px) { .hero-content { grid-column: 2 / 12; padding: 0 36px 80px; } }

        .hero-tag {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(255,255,255,0.8);
          margin-bottom: 14px;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .hero-title {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(40px, 6vw, 68px);
          font-weight: 400; color: #ffffff;
          line-height: 1.05; letter-spacing: -0.01em;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .hero-title em { font-style: italic; color: rgba(255,255,255,0.6); }
        .hero-bar {
          width: 48px; height: 3px; background: #ffffff;
          border-radius: 99px; margin-top: 20px; opacity: 0.7;
          animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both;
        }

        .page-grid {
          display: grid; width: 100%;
          grid-template-columns: repeat(12, 1fr);
          max-width: 1920px; margin: 0 auto;
        }
        .page-col {
          grid-column: 1 / -1;
          padding: 0 24px;
        }
        @media (min-width: 640px) { .page-col { padding: 0 28px; } }
        @media (min-width: 1024px) { .page-col { grid-column: 2 / 12; padding: 0 36px; } }

        .info-map-section {
          padding: 72px 0 80px;
          display: grid;
          gap: 48px;
          grid-template-columns: 1fr;
          border-bottom: 1px solid #ede9e4;
        }
        @media (min-width: 900px) {
          .info-map-section {
            grid-template-columns: 1fr 1fr;
            gap: 64px;
            align-items: start;
          }
        }

        .section-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 0.13em;
          text-transform: uppercase; color: #9e8e82; margin-bottom: 12px;
        }
        .section-heading {
          font-family: 'DM Serif Display', serif;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 400; color: #1a1814; line-height: 1.1; margin-bottom: 20px;
        }
        .section-body {
          font-size: 16px; color: #6b6560; line-height: 1.7;
          margin-bottom: 40px; max-width: 400px;
        }

        .contact-info-list { display: flex; flex-direction: column; gap: 24px; }
        .contact-info-item {
          display: flex; gap: 16px; align-items: flex-start;
        }
        .contact-info-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #f5f2ee; display: flex; align-items: center; justify-content: center;
          color: #6b6560; flex-shrink: 0;
        }
        .contact-info-label {
          font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: #9e8e82; margin-bottom: 4px;
        }
        .contact-info-value {
          font-size: 14.5px; color: #1a1814; line-height: 1.65;
          white-space: pre-line;
        }

        .map-container {
          border-radius: 16px; overflow: hidden;
          border: 1.5px solid #e8e3dd;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04), 0 16px 40px -8px rgba(0,0,0,0.08);
          height: 380px; position: relative;
        }
        @media (min-width: 900px) { .map-container { height: 460px; } }
        .map-container iframe { width: 100%; height: 100%; border: none; display: block; }
        .map-overlay-badge {
          position: absolute; bottom: 16px; left: 16px;
          background: rgba(255,255,255,0.96);
          border: 1px solid #e8e3dd;
          border-radius: 10px; padding: 10px 14px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          display: flex; align-items: center; gap: 8px;
        }
        .map-overlay-dot { width: 8px; height: 8px; border-radius: 50%; background: #e0e0e0; flex-shrink: 0; }
        .map-overlay-text { font-size: 12.5px; font-weight: 500; color: #1a1814; line-height: 1.4; }
        .map-overlay-sub { font-size: 11px; color: #9e8e82; }

        .social-icons {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }
        .social-icon {
          width: 40px; height: 40px; border-radius: 10px;
          border: 1.5px solid #e2ddd7; background: #faf9f7;
          display: flex; align-items: center; justify-content: center;
          color: #4e4a46; text-decoration: none;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
        }
        .social-icon:hover {
          border-color: #ccc; background: #ffffff; color: #1a1814;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="contact-page">

        <div className="hero">
          <img 
            src="/contact hero img.jpg" 
            alt="NF Holding Group Office" 
            className="hero-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
            }}
          />
          <div className="hero-overlay" />
          <div className="hero-inner">
            <div className="hero-spacer" />
            <div className="hero-content">
              <p className="hero-tag">NF Holding Group</p>
              <h1 className="hero-title">
                Contact & Connect
              </h1>
              <div className="hero-bar" />
            </div>
            <div className="hero-spacer" />
          </div>
        </div>

        <div className="page-grid">
          <div className="page-col">
            <div className="info-map-section">

              <div>
                <p className="section-eyebrow">Find Us</p>
                <h2 className="section-heading">Get in Touch</h2>
                <p className="section-body">
                  We'd love to hear from you. Whether you're an investor, partner, or just curious about what we do — our team is always available.
                </p>

                <div className="contact-info-list">
                  {contactInfo.map((item, i) => (
                    <div key={i} className="contact-info-item">
                      <div className="contact-info-icon">{item.icon}</div>
                      <div className="contact-info-text">
                        <div className="contact-info-label">{item.label}</div>
                        <div className="contact-info-value">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="social-icons">
                  <button
                    onClick={() => window.open('https://linkedin.com/company/NF Holdinggroup', '_blank')}
                    className="social-icon"
                    aria-label="LinkedIn (opens in new tab)"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.203 0 22.225 0z"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <div className="map-container">
                  <iframe
                    title="NF Holding Group Office - Ushuru Pension Plaza, Nairobi"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d255282.3585374377!2d36.68219672051632!3d-1.3028611!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f1172d84d49a7%3A0xf7cf0254b297924c!2sNairobi%2C%20Kenya!5e0!3m2!1sen!2ske!4v1708000000000!5m2!1sen!2ske"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    style={{ filter: 'grayscale(15%) contrast(1.05)' }}
                  />
                  <div className="map-overlay-badge">
                    <div className="map-overlay-dot" />
                    <div>
                      <div className="map-overlay-text">NF Holding Group</div>
                      <div className="map-overlay-sub">Ushuru Pension Plaza · Nairobi, Kenya</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </>
  );
}