import React from 'react';
import '../css/Home.css';

const Home = () => {
  return (
    <main className="home-content">
      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title"> These are our main Features</h2>
        
        {/* Promo Video Placeholder */}
        <div className="promo-video">
          <div className="video-container">
            [Promo Video Placeholder]
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-cards">
          <div className="feature-card">
            <h3>Predictive Traffic Forecast</h3>
              <p>
                Get real-time traffic predictions powered by AI that analyzes millions of data points. 
                Our system learns from patterns to forecast congestion before it happens, suggesting 
                optimal departure times and alternative routes.
              </p>
          </div>

          <div className="feature-card">
              <h3>Historical Traffic Insights</h3>
              <p>
                Access 12 months of traffic analytics to plan smarter. See how weather, events, 
                and time of day affect routes. Perfect for scheduling important trips when 
                reliability matters most.
              </p>
            </div>

          <div className="feature-card">
            <h3>Never Reach Late</h3>
            <p>
              Our algorithms provide buffer time recommendations based on your destination's 
              punctuality requirements. Arrive exactly when you need to - whether it's a flight, 
              meeting, or special event.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;