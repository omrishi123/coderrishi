export interface Project {
  id?: string;
  title: string;
  description: string;
  techStack: string[];
  imageUrl: string; // Base64 or standard URL string
  githubLink?: string;
  liveLink?: string;
}

export interface Skill {
  id?: string;
  name: string;
  category: string;
  proficiency: number;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  message: string;
  timestamp: string; // IST ISO String
}

export interface UserProfile {
  id?: string;
  email: string;
  role: 'admin' | 'user';
  passwordHint?: string; // Optional indicator
}

export interface AboutDetails {
  id?: string;
  fullName: string;
  brandName: string;
  bioText: string;
  additionalBio: string;
  profilePhotoBase64: string; // High-fidelity Base64 data-URI representation
}

export interface SocialLink {
  id?: string;
  platform: string;
  url: string;
  color: string; // hex or tailwind class
}
