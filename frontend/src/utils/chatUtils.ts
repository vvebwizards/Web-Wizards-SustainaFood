import { GoogleGenerativeAI } from '@google/generative-ai';
import { organizationInfo } from '../data/organizationData';
// Initialize the Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyBWsb93_soKk6glyLBG6uhAYdIBZ48ClF8'); // Replace with your API key
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// Format timestamp to a readable time
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Generate a bot response using Gemini API
export const generateBotResponse = async (userMessage: string): Promise<string> => {
  try {
    const organizationContext = `
Organization Information:
- Name: ${organizationInfo.name}
- Contact: ${organizationInfo.mainPhone} | ${organizationInfo.email}
- Mission: ${organizationInfo.mission}

Locations:
${organizationInfo.locations.map(loc => `
- ${loc.name}
  Address: ${loc.address}
  Hours: ${loc.hours}
  Phone: ${loc.phone}
  Services: ${loc.services.join(', ')}`).join('\n')}

Accepted Donations:
${organizationInfo.acceptedItems.map(item => `- ${item}`).join('\n')}

Volunteer Opportunities:
${organizationInfo.volunteerRoles.map(role => `- ${role}`).join('\n')}

Guidelines:
${organizationInfo.guidelines.map(guideline => `- ${guideline}`).join('\n')}`;

    const prompt = `You are a helpful assistant for ${organizationInfo.name}. Use the following information about our organization to provide accurate, specific responses to questions about our services, locations, and programs. Always provide real contact information and locations from our database when relevant.

${organizationContext}

User question: ${userMessage}

Provide a helpful, friendly response using our organization's specific information. Keep responses concise and focused on food rescue topics.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating response:', error);
    return "I apologize, but I'm having trouble connecting to my knowledge base right now. Please try asking your question again, or use one of the quick actions below.";
  }
};