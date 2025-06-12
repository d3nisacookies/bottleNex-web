import "../css/Plans.css"

const SubscriptionPlans = () => {
  const plans = [
    {
      title: 'Free Plan',
      price: '$0',
      billing: 'per month',
      features: ['Basic navigation features', 'Limited route previews', 'Standard support'],
    },
    {
      title: 'Premium Monthly',
      price: '$5',
      billing: 'per month',
      features: ['Real-time traffic data', 'Route optimization', 'Priority support'],
    },
    {
      title: 'Premium Annual',
      price: '$4',
      billing: 'per month (billed annually)',
      total: '$48 per year',
      features: ['All monthly features', 'Discounted rate', 'Early access to new tools'],
    },
  ];

  return (
    <div className="subscription-container">
      <h1 className="subscription-title">Subscription Plans</h1>
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
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
