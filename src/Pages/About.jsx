import React from "react";

const team = [
  {
    name: "Muhammad Aqeel",
    role: "Founder & Lead Developer",
    img: "/assets/Aqeel_Profile_Pic.png",
    bio: "Aqeel is passionate about building AI-powered tools that empower job seekers and recruiters alike.",
  },
  {
    name: "Sarah Khan",
    role: "AI Researcher",
    img: "https://randomuser.me/api/portraits/women/44.jpg",
    bio: "Sarah specializes in natural language processing and user experience design.",
  },
];

const values = [
  {
    title: "Innovation",
    desc: "We leverage the latest AI technology to create transformative interview experiences.",
    icon: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=facearea&w=256&q=80", // lightbulb/innovation
  },
  {
    title: "Integrity",
    desc: "Transparency and trust are at the core of everything we build.",
    icon: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&q=80", // handshake/integrity
  },
  {
    title: "Empowerment",
    desc: "We believe everyone deserves access to quality interview preparation tools.",
    icon: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // empowerment icon
  },
  {
    title: "User-Centricity",
    desc: "Every feature is designed with the user's success in mind.",
    icon: "https://cdn-icons-png.flaticon.com/512/1077/1077012.png", // user icon
  },
];

const About = () => {
  return (
    <div className="w-full min-h-[100vh] bg-[#040E1A] flex flex-col items-center font-sans">
      {/* Hero Section */}
      <section className="w-full relative py-20 px-4 flex flex-col items-center text-center overflow-hidden" style={{minHeight:'400px'}}>
        <img src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=facearea&w=1200&q=80" alt="About Nova" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{zIndex:1, opacity:0.25}} />
        <div className="absolute inset-0 bg-black opacity-60 pointer-events-none" style={{zIndex:2}} />
        <div className="relative z-10 flex flex-col items-center w-full">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 drop-shadow-2xl tracking-tight" style={{textShadow:'0 2px 16px #000, 0 1px 0 #000'}}>NOVA Interviewer And ChatBot</h1>
          <p className="text-2xl md:text-3xl text-white mb-6 max-w-2xl mx-auto font-medium" style={{textShadow:'0 2px 16px #000, 0 1px 0 #000'}}>
            Empowering your career journey with AI-driven interview preparation, instant feedback, and a supportive team dedicated to your success.
          </p>
        </div>
      </section>
      {/* Mission & Vision Section */}
      <section className="w-full bg-[#10192b] py-16 px-4 border-b border-[#232b47] flex flex-col items-center">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
          <p className="text-lg text-gray-300 mb-6">
            To make high-quality interview preparation accessible to everyone, everywhere. We harness the power of AI to provide personalized, realistic, and actionable interview practice for all.
          </p>
          <h2 className="text-3xl font-bold text-white mb-4 mt-10">Our Vision</h2>
          <p className="text-lg text-gray-300">
            We envision a world where every candidate can approach interviews with confidence, clarity, and the support of cutting-edge technology.
          </p>
        </div>
        {/* Values Cards */}
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-8">
          {values.map((val, idx) => (
            <div key={idx} className="bg-[#232b47] rounded-2xl shadow-lg border border-gray-800 p-8 flex flex-col items-center text-center">
              <img src={val.icon} alt={val.title} className="h-14 w-14 mb-4 object-contain rounded-xl bg-white" />
              <h3 className="text-xl font-bold text-blue-300 mb-2">{val.title}</h3>
              <p className="text-gray-200 text-base">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Team Section */}
      <section className="w-full bg-[#040E1A] py-20 px-4 border-b border-[#232b47] flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Meet Our Team</h2>
        <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-10">
          {team.map((member, idx) => (
            <div key={idx} className="bg-[#10192b] rounded-2xl shadow-lg border border-gray-800 p-8 flex flex-col items-center text-center hover:scale-[1.03] hover:shadow-2xl transition-transform duration-200">
              <img src={member.img} alt={member.name} className="h-24 w-24 rounded-full border-2 border-blue-400 mb-6 object-cover shadow" />
              <div className="font-bold text-lg text-blue-300 mb-1">{member.name}</div>
              <div className="text-gray-400 mb-2">{member.role}</div>
              <p className="text-gray-200 text-base">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
      {/* Why Choose Us Section */}
      <section className="w-full bg-[#10192b] py-20 px-4 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Why Choose NOVA Interviewer?</h2>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-[#232b47] rounded-2xl shadow-lg border border-gray-800 p-8 flex flex-col items-center text-center">
            <img src="/assets/robot2.jpg" alt="AI Revolution" className="h-20 w-20 mb-4 object-contain rounded-xl" />
            <h3 className="text-xl font-bold text-blue-300 mb-2">Cutting-Edge AI</h3>
            <p className="text-gray-200 text-base">Our platform uses the latest advancements in AI to deliver personalized, adaptive interview experiences for every user.</p>
          </div>
          <div className="bg-[#232b47] rounded-2xl shadow-lg border border-gray-800 p-8 flex flex-col items-center text-center">
            <img src="/assets/Logo3.png" alt="Support" className="h-20 w-20 mb-4 object-contain rounded-xl bg-white" />
            <h3 className="text-xl font-bold text-blue-300 mb-2">Supportive Community</h3>
            <p className="text-gray-200 text-base">We foster a community where users can share experiences, tips, and encouragement, making interview prep less stressful and more effective.</p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="w-full bg-[#040E1A] text-center text-gray-400 text-base py-10 border-t border-[#232b47] mt-12">
        &copy; {new Date().getFullYear()} NOVA Interviewer & ChatBot. Crafted with <span className="text-pink-400">&#10084;</span> by Muhammad Aqeel
      </footer>
    </div>
  );
};

export default About; 