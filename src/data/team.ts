import { TeamMemberData } from '../types';

export const initialTeamMembers: TeamMemberData[] = [
  {
    id: 'gauhar-nadeem',
    name: 'Gauhar Nadeem',
    title: 'CEO & Founder',
    bio: "Visionary leadership driving digital excellence. Gauhar Axe founded Axe's Era Enterprise with a focus on crafting conversion-engineered web platforms, cutting-edge mobile apps, and iconic visual identities.",
    imageUrl: 'https://i.postimg.cc/j2xhztjF/Picsart-26-05-15-00-58-54-392.jpg',
    socials: {
      linkedin: 'https://www.linkedin.com/in/gauharaxe/',
      twitter: 'https://twitter.com/gauharaxe',
      upwork: 'https://www.upwork.com/freelancers/~0131edfc6b7fb25125',
      youtube: 'https://www.youtube.com/@gauharaxe',
      facebook: 'https://www.facebook.com/gauharaxe',
      instagram: 'https://www.instagram.com/gauharaxe'
    }
  }
];

export const teamData: TeamMemberData = initialTeamMembers[0];
