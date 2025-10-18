import Footer from "../components/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-[#f1f1f1] flex flex-col">
      {/* Main Section */}
      <section className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#1800ad] to-[#5e4bff] text-white py-24 px-6">
        <h1 className="text-5xl font-extrabold mb-4">Comfort Zone</h1>
        <p className="text-lg max-w-2xl mb-8">
          Smart environmental monitoring that helps you stay comfortable, productive, and in control — anytime, anywhere.
        </p>
        <div className="flex gap-6">
          <a
            href="/dashboard"
            className="bg-white text-[#1800ad] px-6 py-3 rounded-xl shadow hover:bg-[#1800ad] hover:text-white font-medium transition"
          >
            Go to Dashboard
          </a>
          <a
            href="/ai"
            className="bg-transparent border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-[#1800ad] font-medium transition"
          >
            Try AI Assistant
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="flex flex-col items-center py-20 px-6">
        <h2 className="text-3xl font-bold text-[#1800ad] mb-12">Why Comfort Zone?</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600">
              Keep track of temperature, humidity, and light levels in your environment — updated instantly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">🪟</div>
            <h3 className="text-xl font-semibold mb-2">Smart Control</h3>
            <p className="text-gray-600">
              Automatically adjust windows and lighting based on optimal comfort levels using AI logic.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow hover:shadow-lg transition">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
            <p className="text-gray-600">
              Get personalized recommendations for your environment based on your lifestyle patterns.
            </p>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default Home;
