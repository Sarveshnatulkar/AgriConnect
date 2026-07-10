/**
 * HomePage — Landing page placeholder.
 * Will be replaced with a full landing page in later phases.
 */
function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary-50">
      <div className="card text-center max-w-md w-full mx-4">
        <div className="text-5xl mb-4">🌾</div>
        <h1 className="text-3xl font-bold text-primary-700 mb-2">
          AgriConnect
        </h1>
        <p className="text-gray-500 mb-6">
          Connecting Farmers, Buyers, and Transporters in one ecosystem.
        </p>
        <div className="flex flex-col gap-3">
          <button className="btn-primary">Get Started</button>
          <button className="btn-secondary">Learn More</button>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
