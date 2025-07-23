import React, { useEffect, useState } from 'react';
import '../css/Home.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const Home = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const docRef = doc(db, 'landingPage', 'home');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFeatures(data.features || []);
        } else {
          setError('No features found.');
        }
      } catch (err) {
        setError('Failed to load features.');
      } finally {
        setLoading(false);
      }
    };
    fetchFeatures();
  }, []);

  return (
    <main className="home-content">
      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Our Core Features</h2>
        {/* Promo Video Placeholder */}
        <div className="promo-video">
          <div className="video-container">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Rick Astley - Never Gonna Give You Up (Official Music Video)"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '8px' }}
            ></iframe>
          </div>
        </div>
        {/* Feature Cards */}
        <div className="feature-cards">
          {loading && <p>Loading features...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && features.map((feature) => (
            <div className="feature-card" key={feature.id}>
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