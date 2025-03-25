import React, { useState } from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: "Mystic Arts Training",
      icon: "fa-solid fa-hand-sparkles",
      color: "#10b981",
      description: "Learn the mystical arts under the guidance of Doctor Strange",
    },
    {
      title: "Asgardian Studies",
      icon: "fa-solid fa-hammer",
      color: "#facc15",
      description: "Master Thor's lightning techniques and explore the Nine Realms",
    },
    {
      title: "Wakandan Technology",
      icon: "fa-solid fa-shield-halved",
      color: "#10b981",
      description: "Study vibranium-based tech with Black Panther",
    },
    {
      title: "Quantum Realm Physics",
      icon: "fa-solid fa-atom",
      color: "#facc15",
      description: "Explore quantum mechanics with Ant-Man",
    },
    {
      title: "Enhanced Combat",
      icon: "fa-solid fa-fist-raised",
      color: "#10b981",
      description: "Train with Black Widow and Captain America",
    },
    {
      title: "Cosmic Powers",
      icon: "fa-solid fa-galaxy",
      color: "#facc15",
      description: "Harness cosmic energy with Captain Marvel",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-hidden">
      {/* Hero Section */}
      <div
        className="relative min-h-screen flex items-center pt-24 pb-16 px-4 sm:px-6 lg:px-8"
        style={{
          backgroundImage:
            "url(https://readdy.ai/api/search-image?query=magical castle interior with floating candles, ancient stone walls, magical artifacts, mystical purple and gold light streams, enchanted atmosphere with magical symbols&width=1440&height=800&seq=3&orientation=landscape&flag=6a38e57a0474db1d5d7106111463322f)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-white/70"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight font-serif animate-fade-in-down">
              Welcome to the{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#facc15]">
                Magical World
              </span>{" "}
              of Examinations
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-12 text-gray-600 max-w-3xl mx-auto animate-fade-in-up">
              Embark on a mystical journey through our enchanted examination realm
            </p>

            {/* Login Options */}
            <div className="flex flex-col sm:flex-row justify-center gap-6 sm:gap-8 max-w-2xl mx-auto">
              <Link
                to="/university/login"
                className="bg-white text-gray-800 px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center font-bold text-lg border-2 border-[#10b981]"
              >
                <i className="fa-solid fa-university mr-2 text-[#10b981]"></i>
                University Login
              </Link>
              <Link
                to="/student/login"
                className="bg-white text-gray-800 px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center font-bold text-lg border-2 border-[#facc15]"
              >
                <i className="fa-solid fa-user-graduate mr-2 text-[#facc15]"></i>
                Student Login
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      {/* Features Section */}
      <div className="py-16 sm:py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#facc15]">
              Protected by Ancient Magic
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Our enchanted platform weaves ancient spells with modern magic for an unparalleled experience
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-[#10b981]/50 hover:shadow-lg transform hover:-translate-y-2 transition-all duration-300 shadow-md"
              >
                <i
                  className={`${feature.icon} text-4xl mb-4 animate-pulse`}
                  style={{ color: feature.color }}
                ></i>
                <h3 className="text-xl font-bold mb-2 font-serif" style={{ color: feature.color }}>
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="bg-white py-8 relative border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2023 Hogwarts Examination Portal. Protected by the Magic of xAI.
          </p>
        </div>
      </footer>

      {/* Floating Magical Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              backgroundColor: i % 2 === 0 ? "#10b981" : "#facc15",
              borderRadius: "50%",
              animationDuration: `${Math.random() * 5 + 5}s`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LandingPage;