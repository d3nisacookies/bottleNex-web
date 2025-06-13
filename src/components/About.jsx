import "../css/About.css"

export default function About(){
    const names = ['Ming Han', 'Varsha', 'Aung Kaung', 'Brannon', 'Prabu'];
  
    return (
      <div className="about-container">
        <h1 className="about-title">About Us</h1>
  
        <h2 className="about-subtitle">Who are We?</h2>
  
        <p className="about-description">
          We are a dedicated team of final year project (FYP) students from SIM University of Wollongong (SIM-UOW). Our group is focused on developing innovative solutions for identifying traffic bottlenecks to improve urban traffic flow and reduce congestion.
        </p>
  
        <h2 className="about-subtitle">About our team</h2>
  
        <div className="team-container">
          {names.map((name, index) => (
            <div key={index} className="team-member">
              {name}
            </div>
          ))}
        </div>
      </div>
    );
  }