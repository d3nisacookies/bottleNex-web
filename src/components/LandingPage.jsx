import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLandingPage } from '../context/LandingPageContext';
import { collection, getDocs, query, orderBy, where, doc, getDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import PaymentModal from './PaymentModal.jsx';
import '../css/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { faqContent, setFaqContent, reviewsContent, loading: contextLoading } = useLandingPage();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSubscription, setLastSubscription] = useState(null);
  const [features, setFeatures] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(true);
  const [featuresError, setFeaturesError] = useState(null);
  const [aboutContent, setAboutContent] = useState(null);
  const [aboutLoading, setAboutLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, plan: null });

  // Fetch features from Firebase (like original Home component)
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const docRef = doc(db, 'landingPage', 'home');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFeatures(data.features || []);
        } else {
          setFeaturesError('No features found.');
        }
      } catch (err) {
        setFeaturesError('Failed to load features.');
      } finally {
        setFeaturesLoading(false);
      }
    };
    fetchFeatures();
  }, []);

  // Fetch about content from Firebase
  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const docRef = doc(db, 'landingPage', 'about');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAboutContent(data);
        } else {
          setAboutContent({
            description: 'We are a dedicated team of Final Year Project (FYP) students from SIM University of Wollongong (SIM-UOW). Our group is focused on developing innovative solutions for identifying traffic bottlenecks to improve urban traffic flow and reduce congestion.',
            teamMembers: [
              { name: 'Ming Han', email: 'mhchua007@mymail.sim.edu.sg' },
              { name: 'Varsha', email: 'ramakris005@mymail.sim.edu.sg' },
              { name: 'Aung Kaung', email: 'ungk001@mymail.sim.edu.sg' },
              { name: 'Brannon', email: 'bmhchua002@mymail.sim.edu.sg' },
              { name: 'Prabu', email: 'mariappa001@mymail.sim.edu.sg' }
            ],
            stats: [
              { value: '1M+', label: 'Active Users' },
              { value: '95%', label: 'Accuracy Rate' },
              { value: '24/7', label: 'Real-time Updates' }
            ]
          });
        }
      } catch (err) {
        console.error('Error fetching about content:', err);
        setAboutContent({
          description: 'We are a dedicated team of Final Year Project (FYP) students from SIM University of Wollongong (SIM-UOW). Our group is focused on developing innovative solutions for identifying traffic bottlenecks to improve urban traffic flow and reduce congestion.',
          teamMembers: [
            { name: 'Ming Han', email: 'mhchua007@mymail.sim.edu.sg' },
            { name: 'Varsha', email: 'ramakris005@mymail.sim.edu.sg' },
            { name: 'Aung Kaung', email: 'ungk001@mymail.sim.edu.sg' },
            { name: 'Brannon', email: 'bmhchua002@mymail.sim.edu.sg' },
            { name: 'Prabhu', email: 'mariappa001@mymail.sim.edu.sg' }
          ],
          stats: [
            { value: '1M+', label: 'Active Users' },
            { value: '95%', label: 'Accuracy Rate' },
            { value: '24/7', label: 'Real-time Updates' }
          ]
        });
      } finally {
        setAboutLoading(false);
      }
    };
    fetchAboutContent();
  }, []);

  // Fetch plans from Firebase
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const plansRef = collection(db, 'landingPage', 'subscription_plans', 'plans');
        const q = query(plansRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);
        
        const plansData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter out duplicates based on title and order
        const uniquePlans = plansData.filter((plan, index, self) =>
          index === self.findIndex(p => p.title === plan.title && p.order === plan.order)
        );

        setPlans(uniquePlans);
        console.log('📋 Plans fetched:', uniquePlans);
      } catch (error) {
        console.error('Error fetching plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  // Fetch user's last subscription
  const fetchLastSubscription = async () => {
    if (!currentUser) return;

    console.log('🔍 Fetching subscription for user:', currentUser.uid, currentUser.email);

    try {
      // Simpler query without orderBy to avoid index requirement
      const subscriptionQuery = query(
        collection(db, "subscription_attempts"),
        where("userId", "==", currentUser.uid)
      );
      
      const querySnapshot = await getDocs(subscriptionQuery);
      console.log('🔍 Subscription query result:', querySnapshot.empty ? 'No results' : `${querySnapshot.docs.length} results found`);
      console.log('🔍 Current user UID:', currentUser.uid);
      
      if (!querySnapshot.empty) {
        // Sort by timestamp in JavaScript to get the most recent
        const subscriptions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort by timestamp (newest first)
        subscriptions.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp.toDate() - a.timestamp.toDate();
          }
          return 0;
        });
        
        const lastSub = subscriptions[0];
        console.log('📊 Last subscription data:', lastSub);
        setLastSubscription(lastSub);
      } else {
        console.log('📊 No subscription attempts found for user:', currentUser.uid);
        
        // Let's also try a broader query to see if there are any subscriptions at all
        const allSubscriptionsQuery = query(collection(db, "subscription_attempts"));
        const allSubscriptions = await getDocs(allSubscriptionsQuery);
        console.log('🔍 Total subscriptions in database:', allSubscriptions.docs.length);
        allSubscriptions.docs.forEach((doc, index) => {
          console.log(`📊 Subscription ${index + 1}:`, doc.data());
        });
      }
    } catch (error) {
      console.error("Error fetching last subscription:", error);
    }
  };

  useEffect(() => {
    fetchLastSubscription();
  }, [currentUser]);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle subscription - now opens payment modal
  const handleSubscribe = (plan) => {
    if (!currentUser) {
      navigate("/register");
      return;
    }
    
    // Open payment modal
    setPaymentModal({ isOpen: true, plan });
  };

  // Handle payment success
  const handlePaymentSuccess = async () => {
    // Refresh subscription data
    await fetchLastSubscription();
    
    // Show success message
    alert('Payment successful! Your account has been upgraded to Premium.');
  };

  // Handle download
  const handleDownload = () => {
    console.log('Download initiated');
    // Add your download logic here
  };

  // Handle logout
  const handleLogout = async () => {
    console.log('🔄 Logout initiated');
    try {
      await logout();
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // Get top reviews (like original Review component)
  const getTopReviews = () => {
    if (!reviewsContent) return [];
    
    return reviewsContent
      .filter(r => r.rating >= 4 && !r.flagged)
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
      })
      .slice(0, 3);
  };

  return (
    <div className="landing-page">
      {/* Welcome banner for logged-in users */}
      {currentUser && (
        <div className="welcome-banner">
          Welcome, {currentUser.firstName || currentUser.email.split('@')[0]}!
        </div>
      )}

      {/* Fixed Navigation Bar */}
      <nav className="landing-navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <img src="/logo192.png" alt="BottleNex" className="logo-img" />
            <span className="logo-text">BottleNex</span>
          </div>
          
          <div className="nav-links">
            <button onClick={() => scrollToSection('home')} className="nav-link">Home</button>
            <button onClick={() => scrollToSection('plans')} className="nav-link">Subscription Plans</button>
            <button onClick={() => scrollToSection('review')} className="nav-link">Review</button>
            <button onClick={() => scrollToSection('faq')} className="nav-link">FAQ</button>
            <button onClick={() => scrollToSection('about')} className="nav-link">About Us</button>
            {currentUser && currentUser.role === "admin" && (
              <button onClick={() => navigate('/admin')} className="nav-link admin-link">Admin Dashboard</button>
            )}
          </div>
          
          <div className="nav-buttons">
            {currentUser ? (
              <>
                <button onClick={handleDownload} className="download-btn">Download</button>
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/register')} className="register-btn">Register and Download</button>
                <button onClick={() => navigate('/login')} className="login-btn">Login</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="home-section">
        <div className="container">
          <h1>Our Core Features</h1>
          <div className="video-container">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="BottleNex Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          
          <div className="features-grid">
            {featuresLoading && <p>Loading features...</p>}
            {featuresError && <p style={{ color: 'red' }}>{featuresError}</p>}
            {!featuresLoading && !featuresError && features.map((feature) => (
              <div className="feature-card" key={feature.id}>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section id="plans" className="plans-section">
        <div className="container">
          <h2>Choose Your Plan</h2>
          
          {/* User Status Indicators */}
          {currentUser && !loading && (
            <div className="user-status-container">
              <div className="status-section">
                <h3 className="status-label">Your current account privilege:</h3>
                {/* Premium Status */}
                <div className={`status-indicator ${currentUser.userType === 'Premium' ? 'premium' : 'free'}`}>
                  <span className="status-icon">
                    {currentUser.userType === 'Premium' ? '👑' : '👤'}
                  </span>
                  <span className="status-text">
                    {currentUser.userType === 'Premium' ? 'Premium Account' : 'Free Account'}
                  </span>
                </div>
              </div>
              
              {/* Last Subscription Attempt */}
              {lastSubscription ? (
                <div className="status-section">
                  <h3 className="status-label">Your last subscription attempt:</h3>
                  <div className="status-indicator last-subscription">
                    <span className="status-icon">📅</span>
                    <span className="status-text">
                      {lastSubscription.planTitle} plan
                    </span>
                  </div>
                </div>
              ) : (
                <div className="status-section">
                  <h3 className="status-label">Your last subscription attempt:</h3>
                  <div className="status-indicator no-subscription">
                    <span className="status-icon">📅</span>
                    <span className="status-text">
                      No attempts yet
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {loading ? (
            <div className="loading">Loading plans...</div>
          ) : (
            <div className="plans-grid">
              {plans.map((plan) => (
                <div key={plan.id} className={`plan-card ${plan.title === 'Annual' ? 'popular-plan' : ''}`}>
                  {plan.title === 'Annual' && <div className="popular-badge">Most Popular</div>}
                  <h3>{plan.title}</h3>
                  <div className="plan-price">
                    <span className="price">{plan.price}</span>
                    <span className="billing">{plan.billing}</span>
                  </div>
                  <ul className="plan-features">
                    {plan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button
                    className={`subscribe-button ${
                      lastSubscription && lastSubscription.planTitle === plan.title
                        ? 'subscribed-plan-button'
                        : 'premium-plan-button'
                    }`}
                    onClick={() => handleSubscribe(plan)}
                    disabled={lastSubscription && lastSubscription.planTitle === plan.title}
                  >
                    {lastSubscription && lastSubscription.planTitle === plan.title
                      ? '✓ Subscribed'
                      : 'Subscribe Now'
                    }
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Section */}
      <section id="review" className="review-section">
        <div className="container">
          <h2>What Our Users Say</h2>
          {contextLoading ? (
            <div className="loading">Loading reviews...</div>
          ) : (
            <div className="reviews-grid">
              {getTopReviews().length > 0 ? (
                getTopReviews().map((review, index) => (
                  <div className="review-card" key={index}>
                    <div className="stars">
                      {[...Array(5)].map((_, idx) => (
                        <span key={idx}>{idx < review.rating ? '★' : '☆'}</span>
                      ))}
                    </div>
                    <div className="review-category">{review.category}</div>
                    <p>{review.body}</p>
                    <div className="reviewer-info">
                      <div className="reviewer-name">- {review.reviewer}</div>
                      <div className="review-date">{review.date}</div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No top reviews available.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          {contextLoading ? (
            <div className="loading">Loading FAQ...</div>
          ) : (
            <div className="faq-list">
              {faqContent && faqContent.map((faq, index) => (
                <div key={index} className="faq-item">
                  <h3>#{index + 1} {faq.question}</h3>
                  <p>{faq.answer}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2>About Us</h2>
          {aboutLoading ? (
            <div className="loading">Loading about content...</div>
          ) : (
            <div className="about-content">
              <h3>Who are we?</h3>
              <p className="about-description">
                {aboutContent?.description}
              </p>
              
              <h3>Our Team</h3>
              <div className="team-container">
                {aboutContent?.teamMembers?.map((member, index) => (
                  <div className="team-member" key={index}>
                    <div className="member-info">
                      <div className="member-name">{member.name}</div>
                      <div className="member-email">{member.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, plan: null })}
        plan={paymentModal.plan}
        currentUser={currentUser}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default LandingPage;