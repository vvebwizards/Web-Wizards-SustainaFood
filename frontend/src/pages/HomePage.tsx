import React from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ArrowRight,
  Truck,
  Users,
  Trophy,
  BookOpen,
  Send,
  MapPin,
  Phone,
  Mail,
  Package,
} from "lucide-react";

function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      <section
        className="relative h-screen flex items-center justify-center"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Rescuing Food, Feeding Hope
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Join us in our mission to reduce food waste and feed those in need
          </p>
          <div className="space-y-4">
            <Link
              to="/get-involved"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300"
            >
              Get Involved
            </Link>
            <div>
              <Link
                to="/signin"
                className="inline-block bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">About Us</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                alt="Volunteers working"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                We're dedicated to creating a sustainable food system by
                rescuing surplus food and redistributing it to those in need.
                Our network of volunteers and partners works tirelessly to
                reduce food waste while addressing food insecurity in our
                communities.
              </p>
              
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-12">
          How Food Rescue Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      
          <div className="relative text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Donate Food</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Donors like restaurants and grocers list surplus food on our platform for rescue.
            </p>
          </div>
          <div className="relative text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Truck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Coordinate Delivery</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Volunteers pick up donations and deliver them safely to those in need.
            </p>
          </div>
          <div className="relative text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Support Communities</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Recipients receive fresh food, reducing hunger and waste in our communities.
            </p>
          </div>
        </div>
      </div>
    </section>

      <footer className="bg-gray-900 text-white py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
       
        <div className="space-y-4">
          <h3 className="text-2xl font-bold tracking-tight">SustainaFood</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Making a difference in our community through food rescue and redistribution.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-100">Contact Us</h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-400" />
              <span>Esprit, Ariana, Tunis</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-400" />
              <a href="tel:+1234567890" className="hover:text-green-400 transition-colors">
                (+216) 72108459
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-400" />
              <a href="mailto:info@foodrescue.org" className="hover:text-green-400 transition-colors">
                info@foodrescue.tn
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-100">Follow Us</h4>
          <div className="flex space-x-4">
            <a
              href="https://telegram.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-700 hover:bg-green-500 hover:text-white transition-all transform hover:scale-110"
              aria-label="Follow us on Telegram"
            >
              <Send className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-700 hover:bg-green-500 hover:text-white transition-all transform hover:scale-110"
              aria-label="Follow us on Facebook"
            >
              <Users className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gray-700 hover:bg-green-500 hover:text-white transition-all transform hover:scale-110"
              aria-label="Follow us on Instagram"
            >
              <Heart className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
        <p>© 2025 SustainaFood. All rights reserved.</p>
      </div>
    </footer>
    </div>
  );
}

export default HomePage;
