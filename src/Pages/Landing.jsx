import { NavLink, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import Button from "../Components/Button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";

const reviews = [
  {
    text: "This platform helped me land my dream job! The AI feedback was spot on and the mock interviews felt just like the real thing.",
    name: "Sarah K.",
    title: "Software Engineer, Hired at Top Tech",
    avatar: "/assets/Logo1.jpeg",
  },
  {
    text: "The instant feedback and realistic questions made me so much more confident for my interviews. Highly recommended!",
    name: "John D.",
    title: "Data Analyst, FinTech Startup",
    avatar: "/assets/robot2.jpg",
  },
  {
    text: "I loved the voice and video practice. It felt like a real interview and helped me improve my communication skills.",
    name: "Priya S.",
    title: "Product Manager, SaaS Company",
    avatar: "/assets/Logo.webp",
  },
];

const features = [
  {
    key: "mock-interviews",
    title: "Realistic Mock Interviews",
    icon: "/assets/robot.png",
    desc: "Simulate real interview scenarios tailored to your role and experience level. Practice with AI-driven questions and get comfortable before the real thing.",
    detailImg: "/assets/robot.png",
    detail: "Our mock interview feature lets you experience a real interview environment. The AI adapts questions based on your responses, role, and experience. You can practice as many times as you want, track your progress, and build confidence for your next big opportunity.",
  },
  {
    key: "ai-feedback",
    title: "Instant AI Feedback",
    icon: "/assets/responseDp.png",
    desc: "Get actionable insights on your answers, tone, and communication skills instantly. Improve with every session.",
    detailImg: "/assets/responseDp.png",
    detail: "After each mock interview, our AI analyzes your responses and provides instant feedback. You'll see suggestions on how to improve your answers, communication style, and even your tone. This helps you grow faster and ace your interviews with confidence.",
  },
  {
    key: "voice-video",
    title: "Voice & Video Practice",
    icon: "/assets/Voice1.webp",
    desc: "Practice with voice and video for a complete, immersive interview experience. Perfect your delivery and body language.",
    detailImg: "/assets/Voice1.webp",
    detail: "With voice and video practice, you can simulate real-life interviews. Record your answers, review your body language, and get tips on how to present yourself professionally. This feature is especially useful for remote interviews and video calls.",
  },
];

const faqs = [
  {
    q: "How does the NOVA Interviewer work?",
    a: "Our NOVA Interviewer simulates real interview scenarios, asks relevant questions, and provides instant feedback to help you improve your performance.",
  },
  {
    q: "Can I practice with both voice and video?",
    a: "Yes! You can practice with both voice and video to get a complete interview experience and receive feedback on your communication skills.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use industry-standard encryption and privacy practices to keep your data safe and secure.",
  },
  {
    q: "Can I use this for technical and HR interviews?",
    a: "Yes, our platform supports a wide range of interview types, including technical, HR, and behavioral interviews.",
  },
];


const Landing = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, loading } = useAuth();
  const detailRefs = {
    "mock-interviews": useRef(null),
    "ai-feedback": useRef(null),
    "voice-video": useRef(null),
  };
  const [openFaq, setOpenFaq] = useState(null);
  const scrollToDetail = (key) => {
    const ref = detailRefs[key];
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <div className="w-full min-h-[100vh] flex flex-col items-center justify-center bg-[#040E1A] font-sans">
      {/* Hero Section */}
      <section className="w-full relative py-20 px-4 flex flex-col items-center text-center overflow-hidden" style={{minHeight:'600px'}}>
        {/* Background image only */}
        <img src="/assets/app-importance.png" alt="AI Interviewer" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{zIndex:1}} />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black opacity-60 pointer-events-none" style={{zIndex:2}} />
        {/* Subtle pattern or texture (optional, can be removed if too busy) */}
        {/* <div className="absolute inset-0 pointer-events-none opacity-10" style={{backgroundImage: 'radial-gradient(circle at 40% 40%, #232b47 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex:3}} /> */}
        <div className="relative z-10 flex flex-col items-center w-full">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight" style={{textShadow:'0 2px 16px #000, 0 1px 0 #000'}}> NOVA Interviewer & ChatBot</h1>
          <p className="text-2xl md:text-3xl text-white mb-10 max-w-2xl mx-auto font-medium" style={{textShadow:'0 2px 16px #000, 0 1px 0 #000'}}>
            Prepare for your dream job with AI-powered mock interviews, instant feedback, and real-time Practice anytime, anywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <NavLink to="/signup">
              <Button text={"Sign Up Free"} Class="!text-white !bg-blue-600 !shadow-xl !py-4 !px-10 !text-2xl !rounded-full hover:scale-105 transition-transform duration-200 font-semibold" />
            </NavLink>
            <NavLink to="/login">
              <Button text={"Login"} Class="!text-white !bg-blue-800 !shadow-xl !py-4 !px-10 !text-2xl !rounded-full hover:scale-105 transition-transform duration-200 font-semibold" />
            </NavLink>
          </div>
          {/* Social sign-in buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <button
              className={`flex items-center gap-3 bg-white text-[#232b47] font-semibold rounded-full px-6 py-3 shadow hover:bg-gray-100 transition-all text-lg ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
              style={{minWidth:220}}
              onClick={() => signInWithGoogle(navigate)}
              disabled={loading}
            >
              <FcGoogle className="text-2xl" />
              {loading ? <span>Signing in...</span> : <span>Sign in with Google</span>}
            </button>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="w-full bg-[#040E1A] py-20 px-4 border-b border-[#232b47]">
        <h2 className="text-4xl font-bold text-white mb-14 text-center tracking-tight">Platform Features</h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {features.map((feature) => (
            <div
              key={feature.key}
              className="bg-[#10192b] rounded-2xl shadow-xl border border-gray-800 p-10 flex flex-col items-center text-center cursor-pointer hover:scale-[1.04] hover:shadow-2xl transition-transform duration-200 group"
              onClick={() => scrollToDetail(feature.key)}
            >
              <img src={feature.icon} alt={feature.title} className="h-20 w-20 mb-6 object-contain rounded-xl border-2 border-blue-900 group-hover:border-blue-400 transition-all duration-200" />
              <h3 className="text-2xl font-bold text-blue-300 mb-3 group-hover:text-blue-400 transition-colors duration-200">{feature.title}</h3>
              <p className="text-gray-300 mb-6 text-base font-medium">{feature.desc}</p>
              <Button
                text="Learn More"
                Class="!bg-blue-700 !text-white !rounded-full !px-8 !py-2 !text-lg mt-auto group-hover:!bg-blue-500"
                Click={() => scrollToDetail(feature.key)}
              />
            </div>
          ))}
        </div>
      </section>
      {/* Feature Details Section */}
      <section className="w-full bg-[#10192b] py-20 px-4 border-b border-[#232b47]">
        <div className="max-w-5xl mx-auto flex flex-col gap-20">
          {features.map((feature, idx) => (
            <div
              key={feature.key}
              ref={detailRefs[feature.key]}
              className={`flex flex-col md:flex-row items-center gap-10 bg-[#232b47] rounded-2xl shadow-lg border border-gray-800 p-10 ${idx % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <img src={feature.detailImg} alt={feature.title} className="h-40 w-40 rounded-2xl object-cover mb-6 md:mb-0 shadow-md border-2 border-blue-900" />
              <div>
                <h4 className="text-3xl font-bold text-blue-300 mb-4">{feature.title}</h4>
                <p className="text-gray-200 text-lg mb-2 font-medium">{feature.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Reviews Section */}
      <section className="w-full bg-[#040E1A] py-20 px-4 border-b border-[#232b47]">
        <h2 className="text-4xl font-bold text-white mb-14 text-center tracking-tight">What Our Users Say</h2>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          {reviews.map((review, idx) => (
            <div key={idx} className="bg-[#10192b] rounded-2xl shadow-lg border border-gray-800 p-8 flex flex-col items-center text-center hover:scale-[1.03] hover:shadow-2xl transition-transform duration-200">
              <img src={review.avatar} alt={review.name} className="h-20 w-20 rounded-full border-2 border-blue-400 mb-6 object-cover shadow" />
              <p className="text-gray-200 text-lg mb-6 font-medium">{review.text}</p>
              <div className="mt-auto">
                <div className="font-semibold text-blue-300 text-lg">{review.name}</div>
                <div className="text-gray-400 text-base">{review.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* FAQ Section */}
      <section className="w-full bg-[#10192b] py-20 px-4">
        <h2 className="text-4xl font-bold text-white mb-14 text-center tracking-tight">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#232b47] rounded-lg p-6 border border-gray-800 cursor-pointer transition-all duration-200" onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
              <div className="font-semibold text-blue-300 mb-2 flex items-center justify-between text-lg">
                {faq.q}
                <span className={`ml-2 text-xl transition-transform duration-200 ${openFaq === idx ? 'rotate-90' : ''}`}>{openFaq === idx ? '▼' : '▶'}</span>
              </div>
              {openFaq === idx && <div className="text-gray-200 text-base mt-2 transition-all duration-200">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full bg-[#040E1A] text-center text-gray-400 text-base py-10 border-t border-[#232b47] mt-12">
        &copy; {new Date().getFullYear()} AI Interviewer & ChatBot. Crafted with <span className="text-pink-400">&#10084;</span> by Muhammad Aqeel
      </footer>
    </div>
  );
};

export default Landing; 