import "../css/About.css"

export default function About(){
    const teamMembers = [
      { name: 'Ming Han', email: 'mhchua007@mymail.sim.edu.sg' },
      { name: 'Varsha', email: 'ramakris005@mymail.sim.edu.sg' },
      { name: 'Aung Kaung', email: 'ungk001@mymail.sim.edu.sg' },
      { name: 'Brannon', email: 'bmhchua002@mymail.sim.edu.sg' },
      { name: 'Prabu', email: 'mariappa001@mymail.sim.edu.sg' }
    ];
  
    return (
      <div className="about-container">
        <h1 className="about-title">About Us</h1>
  
        <h2 className="about-subtitle">Who are we?</h2>
  
        <p className="about-description">
          We are a dedicated team of Final Year Project (FYP) students from SIM University of Wollongong (SIM-UOW). Our group is focused on developing innovative solutions for identifying traffic bottlenecks to improve urban traffic flow and reduce congestion.
        </p>
  
        <h2 className="about-subtitle">Our Team</h2>
  
        <div className="team-container">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <div className="member-info">
                <div className="member-name">{member.name}</div>
                <div className="member-email">{member.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }