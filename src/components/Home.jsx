import React from 'react';
import { useLandingPage } from '../context/LandingPageContext';
import '../css/Home.css';

const Home = () => {
  const { homeContent, loading } = useLandingPage();

  if (loading) {
    return (
      <main className="home-content">
        <div className="loading">Loading content...</div>
      </main>
    );
  }

  return (
    <main className="home-content">
      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">{homeContent.sectionTitle || "These are our main Features"}</h2>
        
        {/* Promo Video Placeholder */}
        <div className="promo-video">
          <div className="video-container">
            {homeContent.promoVideoText || "[Promo Video Placeholder]"}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards">
          {homeContent.features && homeContent.features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Home;