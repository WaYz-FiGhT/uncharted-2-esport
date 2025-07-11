import '../App.css';

function YouTubeEmbed({ id }) {
  return (
    <iframe
      width="300"
      height="169"
      src={`https://www.youtube.com/embed/${id}`}
      title="YouTube video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );
}

function Home() {

  return (
    <div className="page-center">
      <section className="home-section">
        <h1>Welcome to Uncharted Esport</h1>
        <p>Welcome to Uncharted Esport!</p>
      </section>
      <section className="home-section">
        <h2>Uncharted Community</h2>
        <p>Check out YouTube channels and latest videos.</p>
        <div className="youtube-grid">
          {['xTdNBjY5i1Q', 'DWy8iSss-Xs', 'GYY9qXq-DAA', 'mylsM4ZQ4Ng'].map(id => (
            <YouTubeEmbed key={id} id={id} />
          ))}
        </div>
      </section>
      <section className="home-section">
        <h2>Discord/h2>
      <p>Contact : <a href="mailto:contact.unchartedesport@gmail.com">contact.unchartedesport@gmail.com</a></p>
      </section>
      <section className="home-section">
        <h2>Future releases</h2>
        <p>Stay tuned for upcoming features.</p>
      </section>
    </div>
  );
}

export default Home;
