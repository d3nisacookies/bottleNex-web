import "../css/About.css"

export default function About(){
    const names = ['Prabu', 'P', 'R', 'A', 'B'];
  
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '50px' }}>About Us</h1>
  
        <h2 style={{ textAlign: 'left', marginBottom: '10px' }}>Who are We?</h2>
  
        <p style={{ maxWidth: '600px', lineHeight: '1.6', marginBottom: '90px' }}>
          We are a dedicated team of final year project (FYP) students from SIM University of Wollongong (SIM-UOW). Our group is focused on developing innovative solutions for identifying traffic bottlenecks to improve urban traffic flow and reduce congestion.
        </p>
  
        <h2 style={{ textAlign: 'left', marginBottom: '20px' }}>About our team</h2>
  
        <div style={{ display: 'flex', gap: '20px', maxWidth: '1300px' }}>
          {names.map((name, index) => (
            <div
              key={index}
              style={{
                width: '250px',
                height: '150px',
                backgroundColor: '#eee',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              }}
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    );
  }