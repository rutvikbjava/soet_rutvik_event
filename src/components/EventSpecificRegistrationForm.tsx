
import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface EventSpecificRegistrationFormProps {
  eventId: Id<"events">;
  onClose: () => void;
  onBack: () => void;
}

interface TeamMember {
  name: string;
  gender: string;
  contactNumber: string;
  emailId: string;
  college: string;
  city: string;
  programBranch: string;
  currentYear: string;
}

export function EventSpecificRegistrationForm({ eventId, onClose, onBack }: EventSpecificRegistrationFormProps) {
  const event = useQuery(api.events.getById, { id: eventId });
  const registerParticipant = useMutation(api.participantRegistrations.registerParticipant);

  // Get event-specific team requirements
  const getEventTeamRequirements = useCallback(() => {
    if (!event) return { isTeamRequired: false, minSize: 1, maxSize: 5, forceTeam: false, forceIndividual: false };
    
    const eventTitle = event.title.toLowerCase();
    
    if (eventTitle.includes("battleclipse") || eventTitle.includes("esports")) {
      // Dynamic team size based on selected game - will be updated in form
      return { isTeamRequired: true, minSize: 4, maxSize: 5, forceTeam: true, forceIndividual: false };
    }
    if (eventTitle.includes("sparkx") || eventTitle.includes("startup")) {
      return { isTeamRequired: true, minSize: 2, maxSize: 5, forceTeam: true, forceIndividual: false };
    }
    if (eventTitle.includes("infinity") || eventTitle.includes("workshop")) {
      return { isTeamRequired: false, minSize: 1, maxSize: 1, forceTeam: false, forceIndividual: true };
    }
    if (eventTitle.includes("stellar") || eventTitle.includes("hackathon")) {
      return { isTeamRequired: true, minSize: 2, maxSize: 5, forceTeam: true, forceIndividual: false };
    }
    if (eventTitle.includes("protonova") || eventTitle.includes("project")) {
      return { isTeamRequired: false, minSize: 1, maxSize: 4, forceTeam: false, forceIndividual: false };
    }
    // Default for other events
    return { isTeamRequired: false, minSize: 1, maxSize: 5, forceTeam: false, forceIndividual: false };
  }, [event]);

  const teamRequirements = getEventTeamRequirements();

  // Get dynamic team requirements for Battleclipse based on selected game
  const getBattleclipseTeamRequirements = () => {
    if (formData.selectedGame === "BGMI") {
      return { minSize: 4, maxSize: 4 };
    }
    if (formData.selectedGame === "Valorant") {
      return { minSize: 5, maxSize: 5 };
    }
    // Default if no game selected
    return { minSize: 4, maxSize: 5 };
  };

  const [formData, setFormData] = useState({
    // Common fields
    fullName: "",
    gender: "",
    contactNumber: "",
    emailId: "",
    collegeName: "",
    city: "",
    programBranch: "",
    currentYear: "",
    
    // Team fields - Initialize based on event requirements
    isTeam: teamRequirements.forceTeam,
    teamName: "",
    teamSize: teamRequirements.forceTeam ? teamRequirements.minSize : 1,
    teamMembers: [] as TeamMember[],
    
    // Event-specific fields
    technicalSkills: "",
    previousExperience: "",
    projectIdea: "",
    projectTitle: "",
    projectAbstract: "",
    projectDomain: "",
    projectType: "",
    needsSpecialSetup: false,
    additionalSpaceRequirements: "",
    startupName: "",
    startupIdea: "",
    robotName: "",
    botDimensions: "",
    selectedGame: "",
    gameUsernames: "",
    laptopAvailable: false,
    
    // Agreement
    agreeToRules: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when event loads and team requirements change
  useEffect(() => {
    if (event) {
      const requirements = getEventTeamRequirements();
      setFormData(prev => ({
        ...prev,
        isTeam: requirements.forceTeam,
        teamSize: requirements.forceTeam ? requirements.minSize : (requirements.forceIndividual ? 1 : prev.teamSize),
        teamMembers: requirements.forceTeam ? 
          Array(requirements.minSize - 1).fill(null).map(() => ({
            name: "",
            gender: "",
            contactNumber: "",
            emailId: "",
            college: "",
            city: "",
            programBranch: "",
            currentYear: ""
          })) : 
          (requirements.forceIndividual ? [] : prev.teamMembers)
      }));
    }
  }, [event, getEventTeamRequirements]); // Added getEventTeamRequirements to dependencies

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const updatedMembers = [...formData.teamMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFormData(prev => ({ ...prev, teamMembers: updatedMembers }));
  };

  const _addTeamMember = () => {
    if (formData.teamMembers.length < formData.teamSize - 1) {
      setFormData(prev => ({
        ...prev,
        teamMembers: [...prev.teamMembers, {
          name: "",
          gender: "",
          contactNumber: "",
          emailId: "",
          college: "",
          city: "",
          programBranch: "",
          currentYear: ""
        }]
      }));
    }
  };

  const _removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToRules) {
      toast.error("Please agree to the rules and regulations");
      return;
    }

    setIsSubmitting(true);

    try {
      await registerParticipant({
        eventId,
        registrationData: {
          fullName: formData.fullName,
          gender: formData.gender,
          contactNumber: formData.contactNumber,
          emailId: formData.emailId,
          collegeName: formData.collegeName,
          collegeUniversity: formData.collegeName,
          departmentYear: `${formData.programBranch} - ${formData.currentYear}`,
          city: formData.city,
          programBranch: formData.programBranch,
          currentYear: formData.currentYear,
          isTeam: formData.isTeam,
          teamName: formData.teamName,
          teamSize: formData.isTeam ? formData.teamSize : 1,
          roleInTeam: "Leader",
          teamMembers: formData.teamMembers.map(member => ({
            name: member.name,
            contactNumber: member.contactNumber,
            emailId: member.emailId,
            gender: member.gender,
            city: member.city,
            programBranch: member.programBranch,
            currentYear: member.currentYear,
            college: member.college
          })),
          technicalSkills: formData.technicalSkills,
          previousExperience: formData.previousExperience,
          projectIdea: formData.projectIdea,
          projectTitle: formData.projectTitle,
          projectAbstract: formData.projectAbstract,
          projectDomain: formData.projectDomain,
          projectType: formData.projectType,
          startupName: formData.startupName,
          startupIdea: formData.startupIdea,
          robotName: formData.robotName,
          botDimensions: formData.botDimensions,
          selectedGame: formData.selectedGame,
          gameUsernames: formData.gameUsernames,
          needsSpecialSetup: formData.needsSpecialSetup,
          additionalSpaceRequirements: formData.additionalSpaceRequirements,
          laptopAvailable: formData.laptopAvailable,
          agreeToRules: formData.agreeToRules,
          eventCategory: event?.category,
          eventTitle: event?.title
        }
      });

      toast.success("Registration successful! 🎉 Redirecting to payment...");
      
      // Close the modal first
      onClose();
      
      // Redirect to payment link if available
      if (event?.paymentLink) {
        // Small delay to allow the success message to be seen
        setTimeout(() => {
          window.open(event.paymentLink, '_blank');
        }, 1500);
      } else {
        // Show message if no payment link is set
        setTimeout(() => {
          toast.info("Payment link not available. Please contact the organizers for payment details.");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getEventSpecificFields = () => {
    if (!event) return null;

    const eventTitle = event.title.toLowerCase();

    // Stellar – Hackathon
    if (eventTitle.includes("stellar") || eventTitle.includes("hackathon")) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-silver">Event-Specific Information</h3>
          
          <div className="bg-supernova-gold/10 border border-supernova-gold/30 rounded-xl p-4 mb-4">
            <p className="text-supernova-gold text-sm font-medium">
              📋 <strong>Team Registration Required:</strong> This event requires mandatory team participation with 2 to 5 members per team.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Technical Skills <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.technicalSkills}
                onChange={(e) => handleInputChange("technicalSkills", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-24 resize-none"
                placeholder="List your technical skills (e.g., Python, React, Node.js, etc.)"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Previous Experience <span className="text-silver/60">(if any)</span>
              </label>
              <textarea
                value={formData.previousExperience}
                onChange={(e) => handleInputChange("previousExperience", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-24 resize-none"
                placeholder="Describe any previous hackathon or project experience"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Project Idea or Area of Interest
              </label>
              <textarea
                value={formData.projectIdea}
                onChange={(e) => handleInputChange("projectIdea", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-24 resize-none"
                placeholder="Brief description of your project idea or area of interest"
              />
            </div>
          </div>
        </div>
      );
    }

    // Protonova – Project Competition
    if (eventTitle.includes("protonova") || eventTitle.includes("project")) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-silver">Project Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Project Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.projectTitle}
                onChange={(e) => handleInputChange("projectTitle", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="Enter your project title"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Abstract/Description <span className="text-red-400">*</span> <span className="text-silver/60">(max 200 words)</span>
              </label>
              <textarea
                required
                value={formData.projectAbstract}
                onChange={(e) => handleInputChange("projectAbstract", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-32 resize-none"
                placeholder="Describe your project in detail (max 200 words)"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">
                Project Domain/Category <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.projectDomain}
                onChange={(e) => handleInputChange("projectDomain", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              >
                <option value="">Select Domain</option>
                <option value="Electronics & Telecommunication (ENTC)">Electronics & Telecommunication (ENTC)</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Interdisciplinary / Open Innovation">Interdisciplinary / Open Innovation</option>
                <option value="Computer Science & IT">Computer Science & IT</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">
                Project Type <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.projectType}
                onChange={(e) => handleInputChange("projectType", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              >
                <option value="">Select Type</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    // SparkX – Startup Pitching
    if (eventTitle.includes("sparkx") || eventTitle.includes("startup")) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-silver">Startup Information</h3>
          
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-4 mb-4">
            <p className="text-silver/80 text-sm">
              <strong>Note:</strong> This event requires mandatory team participation with minimum 2 to maximum 5 members per team.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Startup Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.startupName}
                onChange={(e) => handleInputChange("startupName", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="Enter your startup name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-silver font-medium mb-2">
                Startup Idea <span className="text-red-400">*</span> <span className="text-silver/60">(100-150 words)</span>
              </label>
              <textarea
                required
                value={formData.startupIdea}
                onChange={(e) => handleInputChange("startupIdea", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-32 resize-none"
                placeholder="Describe your startup idea in 100-150 words"
                maxLength={800}
              />
            </div>
          </div>
        </div>
      );
    }

    // CosmoBolt – Robo Race
    if (eventTitle.includes("cosmobolt") || eventTitle.includes("robo")) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-silver">Robot Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-silver font-medium mb-2">
                Robot Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.robotName}
                onChange={(e) => handleInputChange("robotName", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="Enter your robot name"
              />
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">
                Bot Dimensions <span className="text-red-400">*</span> <span className="text-silver/60">(not exceeding 1 ft × 1 ft)</span>
              </label>
              <input
                type="text"
                required
                value={formData.botDimensions}
                onChange={(e) => handleInputChange("botDimensions", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                placeholder="e.g., 0.8 ft × 0.9 ft"
              />
            </div>
          </div>
        </div>
      );
    }

    // Battleclipse – ESports
    if (eventTitle.includes("battleclipse") || eventTitle.includes("esports")) {
      const _battleclipseTeamReq = getBattleclipseTeamRequirements();
      
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-silver">Gaming Information</h3>
          
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-4 mb-4">
            <p className="text-silver/80 text-sm">
              <strong>Note:</strong> This event requires mandatory team participation. Team size depends on selected game:
              <br />• BGMI: Exactly 4 members per team
              <br />• Valorant: Exactly 5 members per team
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-silver font-medium mb-2">
                Selected Game <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.selectedGame}
                onChange={(e) => {
                  const selectedGame = e.target.value;
                  handleInputChange("selectedGame", selectedGame);
                  
                  // Update team size based on selected game
                  if (selectedGame === "BGMI") {
                    handleInputChange("teamSize", 4);
                    // Adjust team members array to 3 members (4-1 for leader)
                    const newMembers = Array(3).fill(null).map(() => ({
                      name: "",
                      gender: "",
                      contactNumber: "",
                      emailId: "",
                      college: "",
                      city: "",
                      programBranch: "",
                      currentYear: ""
                    }));
                    setFormData(prev => ({ ...prev, teamMembers: newMembers }));
                  } else if (selectedGame === "Valorant") {
                    handleInputChange("teamSize", 5);
                    // Adjust team members array to 4 members (5-1 for leader)
                    const newMembers = Array(4).fill(null).map(() => ({
                      name: "",
                      gender: "",
                      contactNumber: "",
                      emailId: "",
                      college: "",
                      city: "",
                      programBranch: "",
                      currentYear: ""
                    }));
                    setFormData(prev => ({ ...prev, teamMembers: newMembers }));
                  }
                }}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
              >
                <option value="">Select Game</option>
                <option value="BGMI">BGMI (4 members)</option>
                <option value="Valorant">Valorant (5 members)</option>
              </select>
            </div>

            <div>
              <label className="block text-silver font-medium mb-2">
                Game Usernames <span className="text-red-400">*</span>
              </label>
              <textarea
                required
                value={formData.gameUsernames}
                onChange={(e) => handleInputChange("gameUsernames", e.target.value)}
                className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300 h-24 resize-none"
                placeholder={`Enter game usernames of all ${formData.selectedGame === "BGMI" ? "4" : formData.selectedGame === "Valorant" ? "5" : "4-5"} team members (one per line)`}
              />
            </div>
          </div>
        </div>
      );
    }

    // Infinity Lab – Technical Workshop
    if (eventTitle.includes("infinity") || eventTitle.includes("workshop")) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-silver">Workshop Information</h3>
          
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-4">
            <p className="text-silver/80 text-sm mb-4">
              <strong>Note:</strong> This event is for individual participation only. Team registration is not allowed.
            </p>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="laptopAvailable"
                checked={formData.laptopAvailable}
                onChange={(e) => handleInputChange("laptopAvailable", e.target.checked)}
                className="w-5 h-5 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue"
              />
              <label htmlFor="laptopAvailable" className="text-silver">
                I have a laptop available for the hands-on training session <span className="text-red-400">*</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    // CodeBurst – Competitive Programming
    if (eventTitle.includes("codeburst") || eventTitle.includes("programming")) {
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-silver">Coding Information</h3>
          
          <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-4">
            <p className="text-silver/80 text-sm mb-4">
              <strong>Note:</strong> This event allows both individual and team participation.
            </p>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="laptopAvailableCoding"
                checked={formData.laptopAvailable}
                onChange={(e) => handleInputChange("laptopAvailable", e.target.checked)}
                className="w-5 h-5 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue"
              />
              <label htmlFor="laptopAvailableCoding" className="text-silver">
                I have a laptop available for the coding challenge <span className="text-red-400">*</span>
              </label>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (!event) {
    return (
      <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-silver">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-dark-blue/95 backdrop-blur-md border border-medium-blue/30 rounded-xl sm:rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-medium-blue/30">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-silver mb-1 sm:mb-2 truncate">
              🚀 Register for {event.title}
            </h2>
            <p className="text-silver/70 text-sm sm:text-base">
              SUPERNOVA – Inter-College Tech Fest (19th & 20th September 2025)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-medium-blue/30 rounded-lg transition-colors text-silver/70 hover:text-silver touch-manipulation ml-2"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => { handleSubmit(e).catch(console.error); }} className="p-4 sm:p-6 overflow-y-auto max-h-[75vh]">
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-silver">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-silver font-medium mb-2">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-silver font-medium mb-2">
                    Gender <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.gender}
                    onChange={(e) => handleInputChange("gender", e.target.value)}
                    className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-silver font-medium mb-2">
                    Contact Number <span className="text-red-400">*</span> <span className="text-silver/60">(preferably WhatsApp)</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                    className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                    placeholder="+91 9876543210"
                  />
                </div>

                <div>
                  <label className="block text-silver font-medium mb-2">
                    Email ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.emailId}
                    onChange={(e) => handleInputChange("emailId", e.target.value)}
                    className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-silver font-medium mb-2">
                    College Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.collegeName}
                    onChange={(e) => handleInputChange("collegeName", e.target.value)}
                    className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                    placeholder="Your college name"
                  />
                </div>

                <div>
                  <label className="block text-silver font-medium mb-2">
                    City <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                    placeholder="Your city"
                  />
                </div>

                <div>
                  <label className="block text-silver font-medium mb-2">
                    Program/Branch/Degree/Stream <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.programBranch}
                    onChange={(e) => handleInputChange("programBranch", e.target.value)}
                    className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                    placeholder="e.g., Computer Science Engineering"
                  />
                </div>

                <div>
                  <label className="block text-silver font-medium mb-2">
                    Current Year of Study <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={formData.currentYear}
                    onChange={(e) => handleInputChange("currentYear", e.target.value)}
                    className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Final Year">Final Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-silver">Team Information</h3>
              
              {/* Conditional team checkbox based on event type */}
              {!teamRequirements.forceTeam && !teamRequirements.forceIndividual && (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isTeam"
                    checked={formData.isTeam}
                    onChange={(e) => {
                      const isTeam = e.target.checked;
                      handleInputChange("isTeam", isTeam);
                      if (isTeam) {
                        handleInputChange("teamSize", teamRequirements.minSize);
                      } else {
                        handleInputChange("teamSize", 1);
                        handleInputChange("teamMembers", []);
                      }
                    }}
                    className="w-5 h-5 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue"
                  />
                  <label htmlFor="isTeam" className="text-silver">
                    I am registering as part of a team
                  </label>
                </div>
              )}
              
              {/* Show team requirements message for forced team events */}
              {teamRequirements.forceTeam && (
                <div className="bg-supernova-gold/10 border border-supernova-gold/30 rounded-xl p-4">
                  <p className="text-supernova-gold text-sm font-medium">
                    📋 <strong>Team Registration Required:</strong> This event requires team participation with {teamRequirements.minSize === teamRequirements.maxSize ? `exactly ${teamRequirements.minSize}` : `${teamRequirements.minSize} to ${teamRequirements.maxSize}`} members.
                  </p>
                </div>
              )}
              
              {/* Show individual participation message for forced individual events */}
              {teamRequirements.forceIndividual && (
                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-xl p-4">
                  <p className="text-accent-blue text-sm font-medium">
                    👤 <strong>Individual Registration Only:</strong> This event is for individual participation only.
                  </p>
                </div>
              )}

              {(formData.isTeam || teamRequirements.forceTeam) && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-silver font-medium mb-2">
                        Team Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.teamName}
                        onChange={(e) => handleInputChange("teamName", e.target.value)}
                        className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver placeholder-silver/50 focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                        placeholder="Enter your team name"
                      />
                    </div>

                    <div>
                      <label className="block text-silver font-medium mb-2">
                        Team Size <span className="text-red-400">*</span>
                      </label>
                      <select
                        required
                        value={formData.teamSize}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          handleInputChange("teamSize", newSize);
                          // Adjust team members array
                          const currentMembers = formData.teamMembers.length;
                          const requiredMembers = newSize - 1; // -1 because leader is not in the array
                          
                          if (requiredMembers > currentMembers) {
                            // Add more members
                            const membersToAdd = requiredMembers - currentMembers;
                            const newMembers = Array(membersToAdd).fill(null).map(() => ({
                              name: "",
                              gender: "",
                              contactNumber: "",
                              emailId: "",
                              college: "",
                              city: "",
                              programBranch: "",
                              currentYear: ""
                            }));
                            setFormData(prev => ({
                              ...prev,
                              teamMembers: [...prev.teamMembers, ...newMembers]
                            }));
                          } else if (requiredMembers < currentMembers) {
                            // Remove excess members
                            setFormData(prev => ({
                              ...prev,
                              teamMembers: prev.teamMembers.slice(0, requiredMembers)
                            }));
                          }
                        }}
                        className="w-full px-4 py-3 bg-dark-blue/30 border border-medium-blue/40 rounded-xl text-silver focus:border-accent-blue focus:ring-2 focus:ring-accent-blue/20 outline-none transition-all duration-300"
                      >
                        {/* Dynamic options based on event type and selected game for Battleclipse */}
                        {(() => {
                          const eventTitle = event?.title?.toLowerCase() || "";
                          
                          if (eventTitle.includes("battleclipse") || eventTitle.includes("esports")) {
                            const battleReqs = getBattleclipseTeamRequirements();
                            return Array.from({ length: battleReqs.maxSize - battleReqs.minSize + 1 }, (_, i) => {
                              const size = battleReqs.minSize + i;
                              return (
                                <option key={size} value={size}>
                                  {size} member{size !== 1 ? 's' : ''}
                                </option>
                              );
                            });
                          }
                          
                          return Array.from({ length: teamRequirements.maxSize - teamRequirements.minSize + 1 }, (_, i) => {
                            const size = teamRequirements.minSize + i;
                            return (
                              <option key={size} value={size}>
                                {size} member{size !== 1 ? 's' : ''}
                              </option>
                            );
                          });
                        })()
                        }
                      </select>
                    </div>
                  </div>

                  {/* Team Members Details */}
                  {formData.teamMembers.map((member, index) => (
                    <div key={index} className="p-4 bg-medium-blue/10 border border-medium-blue/20 rounded-xl">
                      <h4 className="text-silver font-medium mb-4">Team Member {index + 2} Details</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-silver/80 font-medium mb-2">Name *</label>
                          <input
                            type="text"
                            required
                            value={member.name}
                            onChange={(e) => handleTeamMemberChange(index, "name", e.target.value)}
                            className="w-full px-3 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue outline-none transition-all duration-300"
                            placeholder="Member name"
                          />
                        </div>
                        <div>
                          <label className="block text-silver/80 font-medium mb-2">Gender *</label>
                          <select
                            required
                            value={member.gender}
                            onChange={(e) => handleTeamMemberChange(index, "gender", e.target.value)}
                            className="w-full px-3 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver focus:border-accent-blue outline-none transition-all duration-300"
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-silver/80 font-medium mb-2">Contact Number *</label>
                          <input
                            type="tel"
                            required
                            value={member.contactNumber}
                            onChange={(e) => handleTeamMemberChange(index, "contactNumber", e.target.value)}
                            className="w-full px-3 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue outline-none transition-all duration-300"
                            placeholder="Contact number"
                          />
                        </div>
                        <div>
                          <label className="block text-silver/80 font-medium mb-2">Email ID *</label>
                          <input
                            type="email"
                            required
                            value={member.emailId}
                            onChange={(e) => handleTeamMemberChange(index, "emailId", e.target.value)}
                            className="w-full px-3 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue outline-none transition-all duration-300"
                            placeholder="Email address"
                          />
                        </div>
                        <div>
                          <label className="block text-silver/80 font-medium mb-2">College *</label>
                          <input
                            type="text"
                            required
                            value={member.college}
                            onChange={(e) => handleTeamMemberChange(index, "college", e.target.value)}
                            className="w-full px-3 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue outline-none transition-all duration-300"
                            placeholder="College name"
                          />
                        </div>
                        <div>
                          <label className="block text-silver/80 font-medium mb-2">City *</label>
                          <input
                            type="text"
                            required
                            value={member.city}
                            onChange={(e) => handleTeamMemberChange(index, "city", e.target.value)}
                            className="w-full px-3 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue outline-none transition-all duration-300"
                            placeholder="City"
                          />
                        </div>
                        <div>
                          <label className="block text-silver/80 font-medium mb-2">Program/Branch *</label>
                          <input
                            type="text"
                            required
                            value={member.programBranch}
                            onChange={(e) => handleTeamMemberChange(index, "programBranch", e.target.value)}
                            className="w-full px-3 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver placeholder-silver/50 focus:border-accent-blue outline-none transition-all duration-300"
                            placeholder="Program/Branch"
                          />
                        </div>
                        <div>
                          <label className="block text-silver/80 font-medium mb-2">Current Year *</label>
                          <select
                            required
                            value={member.currentYear}
                            onChange={(e) => handleTeamMemberChange(index, "currentYear", e.target.value)}
                            className="w-full px-3 py-2 bg-dark-blue/30 border border-medium-blue/40 rounded-lg text-silver focus:border-accent-blue outline-none transition-all duration-300"
                          >
                            <option value="">Select Year</option>
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                            <option value="Final Year">Final Year</option>
                            <option value="Postgraduate">Postgraduate</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Event-Specific Fields */}
            {getEventSpecificFields()}

            {/* Agreement */}
            <div className="space-y-6">
              <div className="p-4 bg-accent-blue/10 border border-accent-blue/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="agreeToRules"
                    checked={formData.agreeToRules}
                    onChange={(e) => handleInputChange("agreeToRules", e.target.checked)}
                    className="w-5 h-5 text-accent-blue bg-dark-blue border-medium-blue rounded focus:ring-accent-blue mt-1"
                  />
                  <label htmlFor="agreeToRules" className="text-silver text-sm">
                    <span className="text-red-400">*</span> I hereby register for SUPERNOVA – Inter-College Tech Fest (19th & 20th September 2025) organized by the School of Engineering and Technology, MGM University, Chhatrapati Sambhajinagar, and wish to participate in the event <strong>{event.title}</strong>. I declare that the information provided is correct, I agree to follow all event rules, deadlines, and regulations, and I confirm that I have read and understood the official event guidelines.
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-medium-blue/30">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 border border-medium-blue/40 text-silver rounded-xl hover:bg-medium-blue/20 transition-colors"
            >
              ← Back to Events
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.agreeToRules}
              className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all duration-300 ${
                isSubmitting || !formData.agreeToRules
                  ? "bg-medium-blue/20 text-silver/50 cursor-not-allowed"
                  : "bg-gradient-to-r from-supernova-gold to-plasma-orange text-space-navy hover:scale-105 transform"
              }`}
            >
              {isSubmitting ? "Registering..." : "Complete Registration 🚀"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}