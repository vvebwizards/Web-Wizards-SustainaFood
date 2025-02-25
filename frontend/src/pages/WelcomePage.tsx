import React from "react";
import { useAuth } from "../context/AuthContext";
import { UserCog, Heart, Users, Truck } from "lucide-react";

const WelcomePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  let welcomeMessage: string;
  let additionalContent: JSX.Element;
  let IconComponent: React.ElementType = () => null;

  switch (user.role) {
    case "admin":
      welcomeMessage = "Welcome, Administrator!";
      additionalContent = (
        <>
          <p>Here's an overview of system metrics and user management tools.</p>
        </>
      );
      IconComponent = UserCog;
      break;
    case "donor":
      welcomeMessage = "Welcome, Food Donor!";
      additionalContent = (
        <>
          <p>Thank you for your generous contributions. Check your donation history and upcoming events.</p>
        </>
      );
      IconComponent = Heart;
      break;
    case "recipient":
      welcomeMessage = "Welcome, Food Recipient!";
      additionalContent = (
        <>
          <p>Discover available food items and manage your requests right here.</p>
        </>
      );
      IconComponent = Users;
      break;
    case "volunteer":
      welcomeMessage = "Welcome, Delivery Volunteer!";
      additionalContent = (
        <>
          <p>Check your delivery schedule and active assignments.</p>
        </>
      );
      IconComponent = Truck;
      break;
    default:
      welcomeMessage = "Welcome!";
      additionalContent = <p>Navigate the dashboard using the menu.</p>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto bg-white shadow rounded-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-blue-100 rounded-full inline-flex">
            <IconComponent className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">{welcomeMessage}</h1>
        <div className="text-lg text-gray-700">{additionalContent}</div>
      </div>
    </div>
  );
};

export default WelcomePage;
