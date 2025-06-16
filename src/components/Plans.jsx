import "../css/Plans.css";
import { useNavigate } from "react-router-dom";

const SubscriptionPlans = () => {
  const navigate = useNavigate();

  const handleSubscribe = (plan) => {
    navigate("/register"); // Always redirect to register
    // (You can add auth check later when you implement authentication)
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