import React from 'react';
import '../css/Home.css';

const Home = () => {
  return (
    <main className="home-content">
      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Features</h2>
        
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Ut quis dolor id velit tincidunt laoreet. Integer at finibus est,
              et fermentum metus. Mauris vestibulum consectetur turpis.
            </p>
          </div>

          <div className="feature-card">
            <h3>Historical Traffic Data</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Ut quis dolor id velit tincidunt laoreet. Integer at finibus est,
              et fermentum metus. Mauris vestibulum consectetur turpis.
            </p>
          </div>

          <div className="feature-card">
            <h3>Never Reach Late</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              Ut quis dolor id velit tincidunt laoreet. Integer at finibus est,
              et fermentum metus. Mauris vestibulum consectetur turpis.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;