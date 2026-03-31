export default function HowItWorks() {
  return (
    <div className="container" style={{ paddingTop: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 className="gradient-text" style={{ textAlign: 'center', marginBottom: '3rem' }}>How It Works</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '6rem' }}>
        <div className="glass-pane" style={{ padding: '2rem', borderLeft: '4px solid var(--primary)' }}>
          <h2>1. The Subscription Model</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Digital Heroes Golf Charity operates on a strictly subscription-based model. You can choose a monthly rolling plan or a discounted yearly plan. 
            A minimum of 10% of your subscription fee goes directly to a charity of your choice — and you can always opt to increase this percentage!
          </p>
        </div>

        <div className="glass-pane" style={{ padding: '2rem', borderLeft: '4px solid var(--accent)' }}>
          <h2>2. Tracking Your Scores</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Your dashboard allows you to input your recent golf scores (in Stableford format, 1-45). We maintain a rolling window of your most recent 5 scores.
            Whenever you enter a new score, the oldest one is automatically dropped, ensuring that your participation profile always reflects your active gameplay.
          </p>
        </div>

        <div className="glass-pane" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-gold)' }}>
          <h2>3. The Monthly Draw Engine</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Every month, the platform runs a live draw. Depending on which administrative algorithm is active, the engine selects 5 winning numbers (between 1 and 45).
            If your recent 5 scores contain matching numbers:
          </p>
          <ul style={{ color: 'var(--text-muted)', marginLeft: '1.5rem', marginTop: '1rem' }}>
            <li><strong>Match 5:</strong> Win an equal share of 40% of the prize pool (Jackpot rolls over if no winner!).</li>
            <li><strong>Match 4:</strong> Win an equal share of 35% of the prize pool.</li>
            <li><strong>Match 3:</strong> Win an equal share of 25% of the prize pool.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
