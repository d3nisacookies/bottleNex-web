import "../css/Plans.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useState, useEffect } from "react";

const SubscriptionPlans = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [lastSubscription, setLastSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const plans = [
    {
      title: 'Monthly',
      price: '$5',
      billing: 'per month',
      features: ['Basic navigation features', 'Limited route previews', 'Standard support'],
    },
    {
      title: 'Annual',
      price: '$4',
      billing: 'per month',
      features: ['Real-time traffic data', 'Route optimization', 'Priority support'],
    },
    {
      title: 'Semi-annual',
      price: '$4.5',
      billing: 'per month (billed annually)',
      total: '$48 per year',
      features: ['All monthly features', 'Discounted rate', 'Early access to new tools'],
    },
  ];

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
                {plans.map((plan, index) => (
          <div className="plan-card" key={index}>
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
                plan.title === 'Free Plan' ? 'free-plan-button' : 'premium-plan-button'
              }`}
              onClick={() => handleSubscribe(plan)}
            >
              {plan.title === 'Free Plan' ? 'Get Started' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;