import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLandingPage } from "../context/LandingPageContext";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, setDoc, query, getDoc, orderBy } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "../css/AdminDashboard.css";

export default function AdminDashboard() {
  const { currentUser, logout, refreshUserData } = useAuth();
  const { faqContent, homeContent, updateFaqContent, updateHomeContent } = useLandingPage();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [userSubscriptions, setUserSubscriptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [editingPlans, setEditingPlans] = useState(false);
  const [plansForm, setPlansForm] = useState([]);

  // Landing page editing states
  const [editingFaq, setEditingFaq] = useState(false);
  const [editingHome, setEditingHome] = useState(false);
  const [faqForm, setFaqForm] = useState([]);
  const [homeForm, setHomeForm] = useState({});
  const [adminForm, setAdminForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: ""
  });

  // Load users and feedback data
  useEffect(() => {
    loadUsers();
    loadReviews(); // Changed from loadFeedback to loadReviews
    loadSubscriptionPlans();
  }, []);

  // Load subscription plans from Firebase
  const loadSubscriptionPlans = async () => {
    try {
      const plansQuery = query(collection(db, "landingPage", "subscription_plans", "plans"), orderBy("order"));
      const querySnapshot = await getDocs(plansQuery);
      const plansData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSubscriptionPlans(plansData);
      setPlansForm(plansData);
    } catch (error) {
      console.error("Error loading subscription plans:", error);
    }
  };

  // Initialize forms when content loads
  useEffect(() => {
    if (faqContent.length > 0) {
      setFaqForm([...faqContent]);
    }
  }, [faqContent]);

  useEffect(() => {
    if (homeContent.features) {
      setHomeForm({ ...homeContent });
    }
  }, [homeContent]);

  // Create dummy feedback data if none exists
  const createDummyFeedback = async () => {
    console.log("Creating dummy feedback data...");
    const dummyFeedback = [
      {
        reviewer: "Evan Rachel",
        date: "June 10, 2025",
        rating: 4,
        category: "Traffic Bottleneck Identification",
        text: "BottleneX helped me spot traffic jams before I got stuck. The predictive features are really accurate!",
        flagged: false
      },
      {
        reviewer: "Louis Hoffman",
        date: "June 11, 2025",
        rating: 5,
        category: "Route Optimization",
        text: "The app always finds the fastest route for my commute. Saves me 15 minutes every day!",
        flagged: false
      },
      {
        reviewer: "Thomas Middleditch",
        date: "June 12, 2025",
        rating: 3,
        category: "Real-Time Traffic Updates",
        text: "Live updates are accurate and timely. Could use more frequent updates though.",
        flagged: false
      },
      {
        reviewer: "Sarah Johnson",
        date: "June 13, 2025",
        rating: 5,
        category: "User Interface",
        text: "The interface is intuitive and easy to use. Love the clean design!",
        flagged: false
      },
      {
        reviewer: "Mike Chen",
        date: "June 14, 2025",
        rating: 2,
        category: "Battery Usage",
        text: "The app drains my battery too quickly. Needs optimization.",
        flagged: true
      }
    ];

    try {
      for (const feedback of dummyFeedback) {
        await addDoc(collection(db, "feedback"), {
          ...feedback,
          timestamp: Date.now(),
          createdAt: serverTimestamp()
        });
      }
      console.log("Dummy feedback created successfully");
      loadReviews(); // Reload feedback
    } catch (error) {
      console.error("Error creating dummy feedback:", error);
    }
  };

  // Replace loadFeedback with loadReviews
  const loadReviews = async () => {
    setLoading(true);
    try {
      const reviewsDocRef = doc(db, 'landingPage', 'reviews');
      const reviewsDocSnap = await getDoc(reviewsDocRef);
      if (reviewsDocSnap.exists()) {
        const data = reviewsDocSnap.data();
        setFeedback(data.items || []);
      } else {
        setFeedback([]);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscriptions = async () => {
    try {
      const subscriptionsQuery = query(collection(db, "subscription_attempts"));
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      
      const subscriptionsMap = {};
      subscriptionsSnapshot.docs.forEach(doc => {
        const subscription = doc.data();
        const userId = subscription.userId;
        
        if (!subscriptionsMap[userId]) {
          subscriptionsMap[userId] = [];
        }
        subscriptionsMap[userId].push(subscription);
      });
      
      // For each user, get their most recent subscription
      const latestSubscriptions = {};
      Object.keys(subscriptionsMap).forEach(userId => {
        const userSubs = subscriptionsMap[userId];
        // Sort by timestamp to get the most recent
        userSubs.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp.toDate() - a.timestamp.toDate();
          }
          return 0;
        });
        latestSubscriptions[userId] = userSubs[0];
      });
      
      setUserSubscriptions(latestSubscriptions);
    } catch (error) {
      console.error("Error loading user subscriptions:", error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
      
      // Also load subscription data
      await loadUserSubscriptions();
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, status) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: status,
        updatedAt: serverTimestamp()
      });
      loadUsers(); // Reload users
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const updateUserPremium = async (userId, isPremium) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        userType: isPremium ? "Premium" : "Free",
        updatedAt: serverTimestamp()
      });
      loadUsers(); // Reload users
      
      // If the updated user is the current user, refresh their data
      if (currentUser && currentUser.uid === userId) {
        await refreshUserData();
      }
    } catch (error) {
      console.error("Error updating user premium status:", error);
    }
  };

  const flagFeedback = async (feedbackId, flagged) => {
    try {
      // Fetch the current reviews document
      const reviewsDocRef = doc(db, 'landingPage', 'reviews');
      const reviewsDocSnap = await getDoc(reviewsDocRef);
      if (reviewsDocSnap.exists()) {
        const data = reviewsDocSnap.data();
        // Find the review by id or by unique combination (date + reviewer)
        const updatedItems = (data.items || []).map(item => {
          // Use id if present, otherwise fallback to date+reviewer as key
          const key = item.id || (item.date + item.reviewer);
          if (key === feedbackId) {
            return { ...item, flagged: flagged };
          }
          return item;
        });
        // Update the reviews document
        await updateDoc(reviewsDocRef, { items: updatedItems });
        loadReviews(); // Reload reviews
      }
    } catch (error) {
      console.error('Error flagging review:', error);
    }
  };

  const createAdminUser = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminForm.email,
        adminForm.password
      );
      
      await setDoc(doc(db, "users", userCredential.user.uid), {
        firstName: adminForm.firstName,
        lastName: adminForm.lastName,
        email: adminForm.email,
        signUpDate: serverTimestamp(),
        status: true,
        userType: "Admin",
        lastLogin: serverTimestamp(),
        role: "admin"
      });
      
      alert("Admin user created successfully!");
      setAdminForm({ email: "", password: "", firstName: "", lastName: "" });
      loadUsers();
    } catch (error) {
      console.error("Error creating admin user:", error);
      alert(`Error creating admin user: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleFaqEdit = () => {
    setEditingFaq(true);
    setFaqForm([...faqContent]);
  };

  const handleFaqSave = async () => {
    const success = await updateFaqContent(faqForm);
    if (success) {
      setEditingFaq(false);
      alert("FAQ content updated successfully!");
    } else {
      alert("Failed to update FAQ content");
    }
  };

  const handleFaqCancel = () => {
    setEditingFaq(false);
    setFaqForm([...faqContent]);
  };

  const addFaqItem = () => {
    const newId = Math.max(...faqForm.map(item => item.id), 0) + 1;
    setFaqForm([...faqForm, { id: newId, question: "", answer: "" }]);
  };

  const removeFaqItem = (index) => {
    setFaqForm(faqForm.filter((_, i) => i !== index));
  };

  const updateFaqItem = (index, field, value) => {
    const updatedFaq = [...faqForm];
    updatedFaq[index] = { ...updatedFaq[index], [field]: value };
    setFaqForm(updatedFaq);
  };

  const handleHomeEdit = () => {
    setEditingHome(true);
    setHomeForm({ ...homeContent });
  };

  const handleHomeSave = async () => {
    const success = await updateHomeContent(homeForm);
    if (success) {
      setEditingHome(false);
      alert("Home content updated successfully!");
    } else {
      alert("Failed to update Home content");
    }
  };

  const handleHomeCancel = () => {
    setEditingHome(false);
    setHomeForm({ ...homeContent });
  };

  const addHomeFeature = () => {
    const newId = Math.max(...homeForm.features.map(f => f.id), 0) + 1;
    const newFeatures = [...homeForm.features, { id: newId, title: "", description: "" }];
    setHomeForm({ ...homeForm, features: newFeatures });
  };

  const removeHomeFeature = (index) => {
    const newFeatures = homeForm.features.filter((_, i) => i !== index);
    setHomeForm({ ...homeForm, features: newFeatures });
  };

  const updateHomeFeature = (index, field, value) => {
    const updatedFeatures = [...homeForm.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setHomeForm({ ...homeForm, features: updatedFeatures });
  };

  // Subscription Plans editing functions
  const handlePlansEdit = () => {
    setEditingPlans(true);
    setPlansForm([...subscriptionPlans]);
  };

  const handlePlansSave = async () => {
    try {
      // Update each plan in Firebase
      for (const plan of plansForm) {
        await updateDoc(doc(db, "landingPage", "subscription_plans", "plans", plan.id), {
          title: plan.title,
          price: plan.price,
          billing: plan.billing,
          features: plan.features,
          order: plan.order,
          active: plan.active,
          updatedAt: serverTimestamp()
        });
      }
      
      await loadSubscriptionPlans(); // Reload plans
      setEditingPlans(false);
      alert("Subscription plans updated successfully!");
    } catch (error) {
      console.error("Error updating subscription plans:", error);
      alert("Failed to update subscription plans");
    }
  };

  const handlePlansCancel = () => {
    setEditingPlans(false);
    setPlansForm([...subscriptionPlans]);
  };

  const updatePlanField = (index, field, value) => {
    const updatedPlans = [...plansForm];
    updatedPlans[index] = { ...updatedPlans[index], [field]: value };
    setPlansForm(updatedPlans);
  };

  const updatePlanFeature = (planIndex, featureIndex, value) => {
    const updatedPlans = [...plansForm];
    updatedPlans[planIndex].features[featureIndex] = value;
    setPlansForm(updatedPlans);
  };

  const addPlanFeature = (planIndex) => {
    const updatedPlans = [...plansForm];
    updatedPlans[planIndex].features.push("");
    setPlansForm(updatedPlans);
  };

  const removePlanFeature = (planIndex, featureIndex) => {
    const updatedPlans = [...plansForm];
    updatedPlans[planIndex].features.splice(featureIndex, 1);
    setPlansForm(updatedPlans);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome, {currentUser?.firstName || currentUser?.email}!</p>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-navigation">
        <button 
          className={activeSection === "dashboard" ? "active" : ""}
          onClick={() => setActiveSection("dashboard")}
        >
          Dashboard
        </button>
        <button 
          className={activeSection === "users" ? "active" : ""}
          onClick={() => setActiveSection("users")}
        >
          Manage Users
        </button>
        <button 
          className={activeSection === "feedback" ? "active" : ""}
          onClick={() => setActiveSection("feedback")}
        >
          View Feedback
        </button>
        <button 
          className={activeSection === "landing" ? "active" : ""}
          onClick={() => setActiveSection("landing")}
        >
          Edit Landing Page
        </button>
        <button 
          className={activeSection === "subscription-plans" ? "active" : ""}
          onClick={() => setActiveSection("subscription-plans")}
        >
          Edit Subscription Plans
        </button>
        <button 
          className={activeSection === "create-admin" ? "active" : ""}
          onClick={() => setActiveSection("create-admin")}
        >
          Create Admin User
        </button>
      </div>

      <div className="admin-content">
        {activeSection === "dashboard" && (
          <div className="dashboard-overview">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p>{users.length}</p>
              </div>
              <div className="stat-card">
                <h3>Premium Users</h3>
                <p>{users.filter(user => user.userType === "Premium").length}</p>
              </div>
              <div className="stat-card">
                <h3>Active Users</h3>
                <p>{users.filter(user => user.status === true).length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Feedback</h3>
                <p>{feedback.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <div className="manage-users">
            <h2>Manage Users</h2>
            {loading ? (
              <p>Loading users...</p>
            ) : (
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>User Type</th>
                      <th>Status</th>
                      <th>Subscribed Plan</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => {
                      const userSubscription = userSubscriptions[user.id];
                      return (
                        <tr key={user.id}>
                          <td>{user.firstName} {user.lastName}</td>
                          <td>{user.email}</td>
                          <td>{user.userType || "Free"}</td>
                          <td>{user.status ? "Active" : "Suspended"}</td>
                          <td>
                            {userSubscription ? (
                              <div className="subscription-info">
                                <span className="plan-name">{userSubscription.planTitle}</span>
                                <span className="plan-price">({userSubscription.planPrice})</span>
                              </div>
                            ) : (
                              <span className="no-subscription">None</span>
                            )}
                          </td>
                          <td>
                            <button 
                              onClick={() => updateUserPremium(user.id, user.userType !== "Premium")}
                              className={user.userType === "Premium" ? "remove-premium" : "add-premium"}
                            >
                              {user.userType === "Premium" ? "Remove Premium" : "Add Premium"}
                            </button>
                            <button 
                              onClick={() => updateUserStatus(user.id, !user.status)}
                              className={user.status ? "suspend" : "activate"}
                            >
                              {user.status ? "Suspend" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === "feedback" && (
          <div className="view-feedback">
            <h2>View Feedback</h2>
            {loading ? (
              <p>Loading feedback...</p>
            ) : (
              <div className="feedback-list">
                {feedback.map(item => (
                  <div key={item.id || item.date + item.reviewer} className={`feedback-item ${item.flagged ? 'flagged' : ''}`}>
                    <div className="feedback-header">
                      <h4>{item.reviewer || "Anonymous User"}</h4>
                      <span className="date">{item.date || ""}</span>
                      <div className="rating">
                        {[...Array(5)].map((_, idx) => (
                          <span key={idx} className="star">
                            {idx < (item.rating || 3) ? "★" : "☆"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="feedback-category">{item.category || "General Feedback"}</p>
                    <p className="feedback-body">{item.body || item.text || "No feedback content available"}</p>
                    <div className="feedback-actions">
                      <button 
                        onClick={() => flagFeedback(item.id || item.date + item.reviewer, !item.flagged)}
                        className={item.flagged ? "unflag" : "flag"}
                      >
                        {item.flagged ? "Unflag" : "Flag"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "landing" && (
          <div className="edit-landing">
            <h2>Edit Landing Page</h2>
            
            {/* FAQ Editing Section */}
            <div className="landing-section">
              <h3>FAQ Content</h3>
              {!editingFaq ? (
                <div>
                  <button onClick={handleFaqEdit} className="edit-btn">Edit FAQ</button>
                  <div className="preview-content">
                    {faqContent.map((item) => (
                      <div key={item.id} className="preview-item">
                        <h4>#{item.id} {item.question}</h4>
                        <p>{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="edit-form">
                  {faqForm.map((item, index) => (
                    <div key={item.id} className="form-item">
                      <div className="form-row">
                        <label>Question #{item.id}:</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaqItem(index, 'question', e.target.value)}
                          placeholder="Enter question"
                        />
                        <button 
                          onClick={() => removeFaqItem(index)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="form-row">
                        <label>Answer:</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaqItem(index, 'answer', e.target.value)}
                          placeholder="Enter answer"
                          rows="3"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="form-actions">
                    <button onClick={addFaqItem} className="add-btn">Add FAQ Item</button>
                    <button onClick={handleFaqSave} className="save-btn">Save FAQ</button>
                    <button onClick={handleFaqCancel} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              )}
            </div>

            {/* Home Content Editing Section */}
            <div className="landing-section">
              <h3>Home Page Content</h3>
              {!editingHome ? (
                <div>
                  <button onClick={handleHomeEdit} className="edit-btn">Edit Home Content</button>
                  <div className="preview-content">
                    <h4>Section Title: {homeContent.sectionTitle}</h4>
                    <p>Promo Video: {homeContent.promoVideoText}</p>
                    <div className="features-preview">
                      {homeContent.features && homeContent.features.map((feature) => (
                        <div key={feature.id} className="preview-feature">
                          <h5>{feature.title}</h5>
                          <p>{feature.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="edit-form">
                  <div className="form-item">
                    <label>Section Title:</label>
                    <input
                      type="text"
                      value={homeForm.sectionTitle || ""}
                      onChange={(e) => setHomeForm({...homeForm, sectionTitle: e.target.value})}
                      placeholder="Enter section title"
                    />
                  </div>
                  <div className="form-item">
                    <label>Promo Video Text:</label>
                    <input
                      type="text"
                      value={homeForm.promoVideoText || ""}
                      onChange={(e) => setHomeForm({...homeForm, promoVideoText: e.target.value})}
                      placeholder="Enter promo video text"
                    />
                  </div>
                  <div className="form-item">
                    <label>Features:</label>
                    {homeForm.features && homeForm.features.map((feature, index) => (
                      <div key={feature.id} className="feature-edit">
                        <div className="form-row">
                          <label>Feature #{feature.id} Title:</label>
                          <input
                            type="text"
                            value={feature.title}
                            onChange={(e) => updateHomeFeature(index, 'title', e.target.value)}
                            placeholder="Enter feature title"
                          />
                          <button 
                            onClick={() => removeHomeFeature(index)}
                            className="remove-btn"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="form-row">
                          <label>Description:</label>
                          <textarea
                            value={feature.description}
                            onChange={(e) => updateHomeFeature(index, 'description', e.target.value)}
                            placeholder="Enter feature description"
                            rows="3"
                          />
                        </div>
                      </div>
                    ))}
                    <button onClick={addHomeFeature} className="add-btn">Add Feature</button>
                  </div>
                  <div className="form-actions">
                    <button onClick={handleHomeSave} className="save-btn">Save Home Content</button>
                    <button onClick={handleHomeCancel} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Subscription Plans Editing Section */}
        {activeSection === "subscription-plans" && (
          <div className="edit-subscription-plans">
            <h2>Edit Subscription Plans</h2>
            {loading ? (
              <p>Loading subscription plans...</p>
            ) : (
              <div>
                {!editingPlans ? (
                  <div>
                    <button onClick={handlePlansEdit} className="edit-btn">Edit Subscription Plans</button>
                    <div className="plans-preview">
                      {subscriptionPlans.map((plan) => (
                        <div key={plan.id} className="plan-preview-card">
                          <h4>{plan.title}</h4>
                          <p><strong>Price:</strong> {plan.price} {plan.billing}</p>
                          <p><strong>Status:</strong> {plan.active ? "Active" : "Inactive"}</p>
                          <p><strong>Order:</strong> {plan.order}</p>
                          <div className="features-preview">
                            <strong>Features:</strong>
                            <ul>
                              {plan.features.map((feature, index) => (
                                <li key={index}>{feature}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="edit-form">
                    {plansForm.map((plan, planIndex) => (
                      <div key={plan.id} className="plan-edit-card">
                        <h4>Plan #{plan.order}: {plan.title}</h4>
                        
                        <div className="form-row">
                          <label>Title:</label>
                          <input
                            type="text"
                            value={plan.title}
                            onChange={(e) => updatePlanField(planIndex, 'title', e.target.value)}
                            placeholder="Plan title"
                          />
                        </div>
                        
                        <div className="form-row">
                          <label>Price:</label>
                          <input
                            type="text"
                            value={plan.price}
                            onChange={(e) => updatePlanField(planIndex, 'price', e.target.value)}
                            placeholder="e.g., $5"
                          />
                        </div>
                        
                        <div className="form-row">
                          <label>Billing:</label>
                          <input
                            type="text"
                            value={plan.billing}
                            onChange={(e) => updatePlanField(planIndex, 'billing', e.target.value)}
                            placeholder="e.g., per month"
                          />
                        </div>
                        
                        <div className="form-row">
                          <label>Order:</label>
                          <input
                            type="number"
                            value={plan.order}
                            onChange={(e) => updatePlanField(planIndex, 'order', parseInt(e.target.value))}
                            min="1"
                          />
                        </div>
                        
                        <div className="form-row">
                          <label>
                            <input
                              type="checkbox"
                              checked={plan.active}
                              onChange={(e) => updatePlanField(planIndex, 'active', e.target.checked)}
                            />
                            Active
                          </label>
                        </div>
                        
                        <div className="form-item">
                          <label>Features:</label>
                          {plan.features.map((feature, featureIndex) => (
                            <div key={featureIndex} className="feature-edit">
                              <div className="form-row">
                                <input
                                  type="text"
                                  value={feature}
                                  onChange={(e) => updatePlanFeature(planIndex, featureIndex, e.target.value)}
                                  placeholder="Enter feature"
                                />
                                <button 
                                  onClick={() => removePlanFeature(planIndex, featureIndex)}
                                  className="remove-btn"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => addPlanFeature(planIndex)} className="add-btn">
                            Add Feature
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="form-actions">
                      <button onClick={handlePlansSave} className="save-btn">Save Subscription Plans</button>
                      <button onClick={handlePlansCancel} className="cancel-btn">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Temporary Admin Creation Section */}
        {activeSection === "create-admin" && (
          <div className="create-admin">
            <h2>Create Admin User</h2>
            <p>Use this form to create a new Admin User.</p>
            <form onSubmit={createAdminUser} className="admin-form">
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  value={adminForm.firstName}
                  onChange={(e) => setAdminForm({...adminForm, firstName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  value={adminForm.lastName}
                  onChange={(e) => setAdminForm({...adminForm, lastName: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password:</label>
                <input
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" className="create-admin-btn">Create Admin User</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
} 