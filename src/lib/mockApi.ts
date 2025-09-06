// Mock Convex API for development when backend is unavailable
import { useMemo, useState, useEffect } from 'react';

// Mock data for development
const mockEvents = [
  {
    _id: 'mock-event-1',
    _creationTime: Date.now(),
    title: 'Stellar Hackathon 2024',
    description: 'A 6-hour coding marathon where brilliant minds come together to create innovative solutions.',
    category: 'hackathon',
    startDate: '2024-03-15',
    endDate: '2024-03-15',
    location: 'Tech Hub, Mumbai',
    maxParticipants: 100,
    registrationDeadline: '2024-03-10',
    status: 'published' as const,
    organizerId: 'mock-organizer-1',
    judges: ['judge-1', 'judge-2'],
    requirements: ['Laptop', 'Basic programming knowledge'],
    prizes: [
      { position: '1st Place', prize: 'Trophy + Cash Prize', amount: 50000 },
      { position: '2nd Place', prize: 'Trophy + Cash Prize', amount: 30000 },
      { position: '3rd Place', prize: 'Trophy + Cash Prize', amount: 20000 }
    ],
    eventImage: '/api/placeholder/400/200',
    registrationFee: 500,
    paymentLink: 'https://example.com/payment',
    tags: ['React', 'Node.js', 'Innovation'],
    organizer: {
      name: 'Tech Events Team',
      email: 'organizer@techevents.com',
      profile: null
    }
  },
  {
    _id: 'mock-event-2',
    _creationTime: Date.now() - 86400000,
    title: 'AI/ML Workshop',
    description: 'Learn the fundamentals of Artificial Intelligence and Machine Learning.',
    category: 'workshop',
    startDate: '2024-03-20',
    endDate: '2024-03-20',
    location: 'Innovation Center, Bangalore',
    maxParticipants: 50,
    registrationDeadline: '2024-03-18',
    status: 'published' as const,
    organizerId: 'mock-organizer-2',
    judges: [],
    requirements: ['Basic Python knowledge'],
    prizes: [],
    eventImage: '/api/placeholder/400/200',
    registrationFee: 1000,
    tags: ['AI', 'ML', 'Python'],
    organizer: {
      name: 'AI Learning Hub',
      email: 'workshop@ailearning.com',
      profile: null
    }
  },
  {
    _id: 'mock-event-3',
    _creationTime: Date.now() - 172800000,
    title: 'Web Development Competition',
    description: 'Build stunning web applications using modern frameworks.',
    category: 'competition',
    startDate: '2024-03-25',
    endDate: '2024-03-25',
    location: 'Dev Center, Delhi',
    maxParticipants: 75,
    registrationDeadline: '2024-03-22',
    status: 'published' as const,
    organizerId: 'mock-organizer-3',
    judges: ['judge-3', 'judge-4'],
    requirements: ['HTML/CSS/JS knowledge', 'Laptop'],
    prizes: [
      { position: '1st Place', prize: 'Trophy + Internship', amount: 25000 }
    ],
    eventImage: '/api/placeholder/400/200',
    registrationFee: 300,
    tags: ['Web Dev', 'React', 'Vue'],
    organizer: {
      name: 'Web Developers Guild',
      email: 'competition@webdev.com',
      profile: null
    }
  }
];

const mockInstitutions = [
  {
    _id: 'inst-1',
    name: 'Indian Institute of Technology, Mumbai',
    type: 'college',
    logo: '/api/placeholder/100/100'
  },
  {
    _id: 'inst-2', 
    name: 'Delhi Technological University',
    type: 'university',
    logo: '/api/placeholder/100/100'
  }
];

const mockSponsors = [
  {
    _id: 'sponsor-1',
    name: 'TechCorp Solutions',
    type: 'company',
    logo: '/api/placeholder/100/100'
  }
];

// Mock useQuery hook
export function useMockQuery(endpoint: string, args?: any) {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay
    const timer = setTimeout(() => {
      if (endpoint.includes('events.list')) {
        const filteredEvents = args?.status 
          ? mockEvents.filter(event => event.status === args.status)
          : mockEvents;
        setData(filteredEvents);
      } else if (endpoint.includes('participatingInstitutions.getActiveInstitutions')) {
        setData(mockInstitutions);
      } else if (endpoint.includes('participatingInstitutions.getActiveSponsors')) {
        setData(mockSponsors);
      } else if (endpoint.includes('preQualifierTests.getUpcomingTestsNotification')) {
        setData({
          hasActiveTests: false,
          hasUpcomingTests: false,
          activeTestsCount: 0,
          upcomingTestsCount: 0
        });
      } else {
        setData([]);
      }
      setLoading(false);
    }, 500); // 500ms delay to simulate real API

    return () => clearTimeout(timer);
  }, [endpoint, args]);

  if (loading) return undefined;
  return data;
}

// Mock useMutation hook  
export function useMockMutation(endpoint: string) {
  return async (args: any) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Mock mutation called: ${endpoint}`, args);
    return { success: true };
  };
}