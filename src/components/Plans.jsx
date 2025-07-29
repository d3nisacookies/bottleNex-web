import "../css/Plans.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { useState, useEffect } from "react";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [lastSubscription, setLastSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Fetch plans from Firestore
  const fetchPlans = async () => {
    try {
      console.log("🔄 Starting to fetch plans...");
      
      // First, clean up any duplicate plans in the wrong location
      await cleanupDuplicatePlans();
      
      console.log("🔍 Querying plans from: landingPage/subscription_plans/plans");
      const plansQuery = query(collection(db, "landingPage", "subscription_plans", "plans"));
      const querySnapshot = await getDocs(plansQuery);
      
      console.log(`📊 Found ${querySnapshot.docs.length} plans in database`);
      
      if (querySnapshot.empty) {
        console.log("📝 No plans found, initializing default plans...");
        // Initialize default plans if none exist
        await initializeDefaultPlans();
        
        // Fetch again after initialization
        console.log("🔄 Fetching plans again after initialization...");
        const newQuerySnapshot = await getDocs(plansQuery);
        console.log(`📊 Found ${newQuerySnapshot.docs.length} plans after initialization`);
        
        const plansData = newQuerySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("📋 Plans data:", plansData);
        setPlans(plansData);
      } else {
        const plansData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log("📋 Original plans data:", plansData);
        
        // Remove duplicates based on title and order
        const uniquePlans = plansData.filter((plan, index, self) => 
          index === self.findIndex(p => p.title === plan.title && p.order === plan.order)
        );
        
        console.log("📋 Unique plans after filtering:", uniquePlans);
        
        // Sort by order
        uniquePlans.sort((a, b) => a.order - b.order);
        
        console.log("📋 Final sorted plans:", uniquePlans);
        setPlans(uniquePlans);
      }
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      // If there's an error, try to initialize anyway
      console.log("🔄 Trying to initialize plans due to error...");
      try {
        await initializeDefaultPlans();
        const plansQuery = query(collection(db, "landingPage", "subscription_plans", "plans"));
        const querySnapshot = await getDocs(plansQuery);
        const plansData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPlans(plansData);
      } catch (initError) {
        console.error("❌ Error during fallback initialization:", initError);
      }
    } finally {
      setPlansLoading(false);
    }
  };

  // Clean up duplicate plans from the wrong location
  const cleanupDuplicatePlans = async () => {
    try {
      // Check if there are plans in the wrong location (root subscription_plans collection)
      const wrongLocationQuery = query(collection(db, "subscription_plans"));
      const wrongLocationSnapshot = await getDocs(wrongLocationQuery);
      
      if (!wrongLocationSnapshot.empty) {
        console.log("🗑️ Found duplicate plans in wrong location, cleaning up...");
        
        // Delete all documents in the wrong location
        const deletePromises = wrongLocationSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        
        console.log("✅ Cleaned up duplicate plans from wrong location");
      }
    } catch (error) {
      console.error("Error cleaning up duplicate plans:", error);
    }
  };

  // Initialize default plans in Firestore
  const initializeDefaultPlans = async () => {
    try {
      // First, ensure the parent document exists
      const parentDocRef = doc(db, "landingPage", "subscription_plans");
      await setDoc(parentDocRef, {
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      console.log("✅ Parent document created/updated");
      
      const defaultPlans = [
        {
          title: 'Monthly',
          price: '$5',
          billing: 'per month',
          features: ['Basic navigation features', 'Limited route previews', 'Standard support'],
          order: 1,
          active: true
        },
        {
          title: 'Annual',
          price: '$48',
          billing: 'per year',
          features: ['Real-time traffic data', 'Route optimization', 'Priority support', 'Save 20% compared to monthly'],
          order: 2,
          active: true
        },
        {
          title: 'Semi-annual',
          price: '$27',
          billing: 'per 6 months',
          features: ['All monthly features', 'Discounted rate', 'Early access to new tools', 'Save 10% compared to monthly'],
          order: 3,
          active: true
        }
      ];

      // Create each plan document
      for (const plan of defaultPlans) {
        await addDoc(collection(db, "landingPage", "subscription_plans", "plans"), {
          ...plan,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Created plan: ${plan.title}`);
      }
      
      console.log("✅ All default plans initialized in Firestore");
    } catch (error) {
      console.error("❌ Error initializing default plans:", error);
    }
  };

  // Fetch user's last subscription attempt
  const fetchLastSubscription = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

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
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription data when component mounts
  useEffect(() => {
    fetchLastSubscription();
    fetchPlans(); // Fetch plans when component mounts
  }, [currentUser]);

  const handleSubscribe = async (plan) => {
    try {
      // Log subscription attempt to Firebase
      if (currentUser) {
        await addDoc(collection(db, "subscription_attempts"), {
          userId: currentUser.uid,
          userEmail: currentUser.email,
          userName: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : currentUser.email,
          planTitle: plan.title,
          planPrice: plan.price,
          planBilling: plan.billing,
          planTotal: plan.total || null,
          timestamp: serverTimestamp(),
          status: "attempted"
        });
        
        console.log(`✅ Subscription attempt logged for ${plan.title} plan`);
        
        // Refresh the last subscription data
        await fetchLastSubscription();
        
        // Show success message (you can replace this with a proper notification)
        alert(`Thank you for your interest in the ${plan.title} plan! Your subscription attempt has been logged.`);
      } else {
        // If user is not logged in, redirect to register
        navigate("/register");
      }
    } catch (error) {
      console.error("❌ Error logging subscription attempt:", error);
      alert("There was an error processing your subscription request. Please try again.");
    }
  };

  return (
    <div className="subscription-container">
      <h1 className="subscription-title">Subscription Plans & pricings</h1>
      
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
      
      <div className="plans-wrapper">
        {plansLoading ? (
          <div className="loading-container">
            <p>Loading subscription plans...</p>
            <button 
              onClick={async () => {
                setPlansLoading(true);
                await initializeDefaultPlans();
                await fetchPlans();
              }}
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Initialize Plans (Debug)
            </button>
          </div>
        ) : plans.filter(plan => plan.active).length === 0 ? (
          <div className="no-plans-container">
            <p>No subscription plans available. Please check back later.</p>
            <button 
              onClick={async () => {
                setPlansLoading(true);
                await initializeDefaultPlans();
                await fetchPlans();
              }}
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px', 
                backgroundColor: '#4CAF50', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Initialize Plans
            </button>
          </div>
        ) : (
          plans
            .filter(plan => plan.active)
            .map((plan, index) => (
            <div className={`plan-card ${plan.title === 'Annual' ? 'popular-plan' : ''}`} key={plan.id || index}>
              {plan.title === 'Annual' && (
                <div className="popular-badge">Most Popular</div>
              )}
              <h2 className="plan-title">{plan.title}</h2>
              <p className="plan-price">{plan.price}</p>
              <p className="plan-billing">{plan.billing}</p>
              {plan.total && <p className="plan-total">{plan.total}</p>}
              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>✅ {feature}</li>
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
          ))
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlans;