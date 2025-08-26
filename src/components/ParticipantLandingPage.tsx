import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ParticipantRegistrationForm } from "./ParticipantRegistrationForm";
import { ParticipantTestPage } from "./ParticipantTestPage";

interface ParticipantLandingPageProps {
  onSwitchToOrganizer: () => void;
}

export function ParticipantLandingPage({ onSwitchToOrganizer }: ParticipantLandingPageProps) {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [showPreQualifierTests, setShowPreQualifierTests] = useState(false);

  const events = useQuery(api.events.list, {});
  const publishedEvents = events?.filter(event => event.status === "published") || [];
  const testNotification = useQuery(api.preQualifierTests.getUpcomingTestsNotification);

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-navy via-charcoal to-dark-blue">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-space-navy/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-full flex items-center justify-center">
                <span className="text-space-navy font-bold text-lg">🚀</span>
              </div>
              <span className="text-2xl font-bold text-starlight-white">
                Hackathon Hub
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowRegistrationForm(true)}
                className="px-6 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
              >
                Register Now
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowPreQualifierTests(true)}
                  className="px-6 py-2 bg-gradient-to-r from-accent-blue to-electric-blue text-starlight-white font-bold rounded-lg hover:scale-105 transform transition-all duration-300 flex items-center gap-2"
                >
                  <span>🎯</span>
                  Pre-Qualifier Tests
                </button>

                {/* Test notification badge */}
                {testNotification && (testNotification.hasActiveTests || testNotification.hasUpcomingTests) && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(testNotification.activeTestsCount || 0) + (testNotification.upcomingTestsCount || 0)}
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={onSwitchToOrganizer}
                className="px-4 py-2 border border-white/20 text-starlight-white rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                Organizer Login
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold text-starlight-white mb-6 leading-tight">
              Join the Ultimate
              <span className="block bg-gradient-to-r from-supernova-gold via-electric-blue to-nebula-pink bg-clip-text text-transparent">
                Coding Challenge
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-starlight-white/80 max-w-3xl mx-auto leading-relaxed">
              Connect with brilliant minds, build innovative solutions, and compete for amazing prizes in the most exciting hackathon of the year!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="px-8 py-4 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-xl text-lg hover:scale-105 transform transition-all duration-300 shadow-lg shadow-supernova-gold/30"
            >
              🚀 Register for Hackathon
            </button>
            <button
              onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border-2 border-electric-blue text-electric-blue font-bold rounded-xl text-lg hover:bg-electric-blue hover:text-space-navy transition-all duration-300"
            >
              🎯 View Events
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-supernova-gold mb-2">500+</div>
              <div className="text-starlight-white/70">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-electric-blue mb-2">₹50K+</div>
              <div className="text-starlight-white/70">Prize Pool</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-nebula-pink mb-2">48hrs</div>
              <div className="text-starlight-white/70">Coding Marathon</div>
            </div>
          </div>
        </div>
      </section>

      {/* College Promotions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-starlight-white mb-12">
            🎓 Participating Colleges & Universities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "IIT Delhi", students: "150+", logo: "🏛️" },
              { name: "NIT Trichy", students: "120+", logo: "🎯" },
              { name: "BITS Pilani", students: "100+", logo: "⭐" },
              { name: "VIT Vellore", students: "80+", logo: "🚀" },
              { name: "SRM University", students: "90+", logo: "💎" },
              { name: "Manipal Institute", students: "70+", logo: "🌟" }
            ].map((college, index) => (
              <div key={index} className="p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 hover:shadow-xl transition-all duration-300">
                <div className="text-center">
                  <div className="text-4xl mb-4">{college.logo}</div>
                  <h3 className="text-xl font-bold text-starlight-white mb-2">{college.name}</h3>
                  <p className="text-supernova-gold font-semibold">{college.students} Students Registered</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-starlight-white mb-12">
            🎯 Upcoming Events
          </h2>
          
          {publishedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {publishedEvents.map((event) => (
                <div key={event._id} className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-stellar-blue via-cosmic-purple to-nebula-pink p-1 hover:scale-105 transition-all duration-300">
                  <div className="relative h-full bg-space-navy/90 backdrop-blur-md rounded-xl p-6">
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        event.status === 'published' ? 'bg-supernova-gold/20 text-supernova-gold' :
                        event.status === 'ongoing' ? 'bg-stellar-blue/20 text-stellar-blue' :
                        'bg-medium-blue/20 text-silver/60'
                      }`}>
                        {event.status}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-starlight-white mb-3 group-hover:text-supernova-gold transition-colors">
                      {event.title}
                    </h3>
                    
                    <p className="text-starlight-white/70 text-sm mb-4 line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                        <span>📅</span>
                        {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                        <span>📍</span>
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                        <span>👥</span>
                        Max {event.maxParticipants} participants
                      </div>
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {event.tags.slice(0, 3).map((tag: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-cosmic-purple/30 text-starlight-white rounded text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setShowRegistrationForm(true)}
                      className="w-full px-4 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
                    >
                      Register Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-starlight-white mb-4">
                Exciting Events Coming Soon!
              </h3>
              <p className="text-starlight-white/70 mb-6">
                Stay tuned for amazing hackathons and coding competitions.
              </p>
              <button
                onClick={() => setShowRegistrationForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-xl hover:scale-105 transform transition-all duration-300"
              >
                Pre-Register Now
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Participate Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-starlight-white mb-12">
            🌟 Why Participate?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: "🏆", title: "Win Prizes", desc: "Compete for cash prizes, internships, and job opportunities" },
              { icon: "🤝", title: "Network", desc: "Connect with like-minded developers and industry experts" },
              { icon: "📚", title: "Learn", desc: "Gain hands-on experience with cutting-edge technologies" },
              { icon: "🚀", title: "Build", desc: "Create innovative solutions to real-world problems" }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-dark-blue/40 backdrop-blur-md border border-medium-blue/30 rounded-xl hover:border-accent-blue/40 transition-all duration-300">
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-starlight-white mb-2">{benefit.title}</h3>
                <p className="text-starlight-white/70 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-supernova-gold to-plasma-orange rounded-full flex items-center justify-center">
              <span className="text-space-navy font-bold text-lg">🚀</span>
            </div>
            <span className="text-2xl font-bold text-starlight-white">Hackathon Hub</span>
          </div>
          <p className="text-starlight-white/60 mb-4">
            Empowering the next generation of innovators through competitive coding.
          </p>
          <div className="flex justify-center gap-6">
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
            >
              Register Now
            </button>

            <div className="relative">
              <button
                onClick={() => setShowPreQualifierTests(true)}
                className="px-6 py-2 bg-gradient-to-r from-accent-blue to-electric-blue text-starlight-white font-bold rounded-lg hover:scale-105 transform transition-all duration-300 flex items-center gap-2"
              >
                <span>🎯</span>
                Pre-Qualifier Tests
              </button>

              {/* Test notification badge */}
              {testNotification && (testNotification.hasActiveTests || testNotification.hasUpcomingTests) && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {(testNotification.activeTestsCount || 0) + (testNotification.upcomingTestsCount || 0)}
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={onSwitchToOrganizer}
              className="px-6 py-2 border border-white/20 text-starlight-white rounded-lg hover:bg-white/10 transition-colors"
            >
              Organizer Portal
            </button>
          </div>
        </div>
      </footer>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <ParticipantRegistrationForm onClose={() => setShowRegistrationForm(false)} />
      )}

      {/* Pre-Qualifier Tests Modal */}
      {showPreQualifierTests && (
        <ParticipantTestPage onClose={() => setShowPreQualifierTests(false)} />
      )}
    </div>
  );
}
