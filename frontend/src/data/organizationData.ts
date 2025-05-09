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
  mainPhone: "(555) 123-4567",
  email: "info@sustainafood.org",
  website: "www.sustainafood.org",
  mission: "Our mission is to create a sustainable food ecosystem by rescuing surplus food from restaurants, grocers, and farms, redistributing it to those in need while reducing food waste and building a more sustainable community.",
  locations: [
    {
      name: "Main Distribution Center",
      address: "123 Main Street, Cityville, ST 12345",
      hours: "Monday-Friday 9am-7pm, Saturday 10am-4pm",
      phone: "(555) 123-4567",
      services: ["Food Distribution", "Donation Drop-off", "Volunteer Check-in"]
    },
    {
      name: "North District Hub",
      address: "456 North Ave, Cityville, ST 12346",
      hours: "Monday-Saturday 10am-6pm",
      phone: "(555) 234-5678",
      services: ["Food Distribution", "Donation Drop-off"]
    },
    {
      name: "South Community Center",
      address: "789 South Blvd, Cityville, ST 12347",
      hours: "Tuesday-Sunday 9am-5pm",
      phone: "(555) 345-6789",
      services: ["Food Distribution", "Community Kitchen"]
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