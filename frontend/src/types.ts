export interface Startup {
  id: string;
  name: string;
  description: string;
  industry: string;
  stage: 'ideation' | 'mvp' | 'growth' | 'scaling';
  businessModel: string;
  keyNeeds: string[];
  founderUid: string;
  createdAt: string;
}

export interface Mentor {
  id: string;
  name: string;
  bio: string;
  expertise: string[];
  industries: string[];
  successScore: number;
  strengthDomains: string[];
  weakDomains: string[];
  totalEngagements: number;
}

export interface Match {
  id: string;
  startupId: string;
  mentorId: string;
  score: number;
  reasoning: string;
  status: 'pending' | 'approved' | 'rejected' | 'auto_assigned';
  createdAt: string;
}

export interface Engagement {
  id: string;
  startupId: string;
  mentorId: string;
  status: 'active' | 'completed';
  startDate: string;
  endDate?: string;
  milestones: string[];
}

export interface Outcome {
  id: string;
  engagementId: string;
  startupId: string;
  mentorId: string;
  progressRating: number;
  feedback: string;
  fundingGrowth: number;
  userGrowth: number;
  completedAt: string;
}
