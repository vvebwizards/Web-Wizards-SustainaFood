export interface LocationInfo {
  name: string;
  address: string;
  hours: string;
  phone: string;
  services: string[];
}

export interface OrganizationData {
  name: string;
  mainPhone: string;
  email: string;
  website: string;
  mission: string;
  locations: LocationInfo[];
  acceptedItems: string[];
  volunteerRoles: string[];
  guidelines: string[];
}

export const organizationInfo: OrganizationData = {
  name: "SustainaFood",
  mainPhone: "+216 26762772",
  email: "info@sustainafood.org",
  website: "www.sustainafood.org",
  mission: "Our mission is to create a sustainable food ecosystem by rescuing surplus food from restaurants, grocers, and farms, redistributing it to those in need while reducing food waste and building a more sustainable community.",
locations: [
  {
    name: "Centre de Distribution Principal",
    address: "Rue de Marseille, Lafayette, Tunis 1002",
    hours: "Lundi-Vendredi 9h-19h, Samedi 10h-16h",
    phone: "+216 71 234 567",
    services: ["Distribution Alimentaire", "Dépôt de Dons", "Accueil des Bénévoles"]
  },
  {
    name: "Hub District Nord",
    address: "Avenue Hédi Nouira, Ennasr 2, Ariana 2037",
    hours: "Lundi-Samedi 10h-18h",
    phone: "+216 71 345 678",
    services: ["Distribution Alimentaire", "Dépôt de Dons"]
  },
  {
    name: "Centre Communautaire Sud",
    address: "Avenue Habib Bourguiba, Mégrine, Ben Arous 2033",
    hours: "Mardi-Dimanche 9h-17h",
    phone: "+216 71 456 789",
    services: ["Distribution Alimentaire", "Cuisine Communautaire"]
  }
],
  acceptedItems: [
    "Non-perishable canned goods",
    "Fresh fruits and vegetables",
    "Dairy products (unopened)",
    "Bread and baked goods",
    "Frozen meals (unopened)",
    "Prepared foods (unserved)",
    "Packaged snacks",
    "Beverages (non-alcoholic)"
  ],
  volunteerRoles: [
    "Food Sorter",
    "Distribution Assistant",
    "Delivery Driver",
    "Kitchen Helper",
    "Administrative Support",
    "Donation Pickup Coordinator"
  ],
  guidelines: [
    "All food must be within use-by dates",
    "Packaging must be intact and unopened",
    "Temperature-sensitive items must maintain proper temperature chain",
    "No homemade items accepted",
    "All prepared foods must come from licensed facilities"
  ]
};