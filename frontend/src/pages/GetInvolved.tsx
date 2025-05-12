import React from 'react';
import { Truck, Users, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

function GetInvolved() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">Choose Your Role</h1>
        <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          Join our community and make a difference in reducing food waste. Select the role that best fits your contribution to our mission.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Donor Card */}
          <Link 
            to="/signup"
            state={{ role: "donor" }}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4">Food Donor</h3>
              <p className="text-gray-600 text-center mb-6">
                Have surplus food to share? Join as a donor and help reduce food waste while supporting your community.
              </p>
            </div>
          </Link>

          {/* Recipient Card */}
          <Link 
            to="/signup"
            state={{ role: "recipient" }}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4">Food Recipient</h3>
              <p className="text-gray-600 text-center mb-6">
                Organizations serving communities in need can register to receive food donations.
              </p>
            </div>
          </Link>

          {/* Delivery Volunteer Card */}
          <Link 
            to="/signup"
            state={{ role: "volunteer" }}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform hover:scale-105 hover:shadow-xl"
          >
            <div className="p-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-center mb-4">Delivery Volunteer</h3>
              <p className="text-gray-600 text-center mb-6">
                Help bridge the gap by delivering food from donors to recipients in your community.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default GetInvolved;
