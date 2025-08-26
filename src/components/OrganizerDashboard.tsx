import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CreateEventModal } from "./CreateEventModal";

interface OrganizerDashboardProps {
  profile: any;
  stats: any;
}

export function OrganizerDashboard({ profile, stats }: OrganizerDashboardProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const events = useQuery(api.events.list, {});
  const myEvents = events?.filter(event => event.organizerId === profile.userId) || [];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-starlight-white to-supernova-gold bg-clip-text text-transparent mb-2">
              Event Command Center 🎯
            </h1>
            <p className="text-starlight-white/70 text-lg">
              Welcome back, {profile.firstName}! Ready to create stellar experiences?
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-supernova-gold/25 flex items-center gap-2"
          >
            <span>➕</span> Create Event
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "My Events", 
              value: stats.myEvents, 
              icon: "🌟", 
              color: "from-supernova-gold to-plasma-orange"
            },
            { 
              label: "Active Events", 
              value: stats.activeEvents, 
              icon: "🚀", 
              color: "from-stellar-blue to-cosmic-purple"
            },
            { 
              label: "Total Registrations", 
              value: stats.totalRegistrations, 
              icon: "👥", 
              color: "from-nebula-pink to-cosmic-purple"
            },
            { 
              label: "Draft Events", 
              value: stats.draftEvents, 
              icon: "📝", 
              color: "from-plasma-orange to-supernova-gold"
            }
          ].map((stat, index) => (
            <div key={index} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-2xl blur group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-supernova-gold/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{stat.icon}</div>
                </div>
                <div className="text-3xl font-bold text-starlight-white mb-1">{stat.value}</div>
                <div className="text-starlight-white/70 text-sm">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* My Events */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-starlight-white mb-6 flex items-center gap-2">
            <span>🎪</span> My Events
          </h3>
          
          {myEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents.map((event) => (
                <div key={event._id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-supernova-gold/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-bold text-starlight-white group-hover:text-supernova-gold transition-colors">
                      {event.title}
                    </h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'published' ? 'bg-supernova-gold/30 text-supernova-gold' :
                      event.status === 'ongoing' ? 'bg-stellar-blue/30 text-stellar-blue' :
                      event.status === 'completed' ? 'bg-nebula-pink/30 text-nebula-pink' :
                      'bg-white/20 text-starlight-white/70'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  
                  <p className="text-starlight-white/70 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                      <span>📅</span>
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                      <span>📍</span>
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2 text-starlight-white/60 text-sm">
                      <span>👥</span>
                      0 / {event.maxParticipants} registered
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-2 bg-stellar-blue hover:bg-stellar-blue/80 text-starlight-white rounded text-sm transition-colors">
                      Manage
                    </button>
                    <button className="flex-1 px-3 py-2 bg-cosmic-purple hover:bg-cosmic-purple/80 text-starlight-white rounded text-sm transition-colors">
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h4 className="text-xl font-bold text-starlight-white mb-2">No Events Yet</h4>
              <p className="text-starlight-white/70 mb-6">
                Ready to launch your first stellar event? The cosmos awaits!
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy font-bold rounded-lg hover:scale-105 transform transition-all duration-300"
              >
                Create Your First Event
              </button>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateEventModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
