import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight, Truck, Users, Trophy, BookOpen, Send } from 'lucide-react';

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
{/* Hero Section */}
<section
className="relative h-screen flex items-center justify-center"
style={{
backgroundImage: 'url("https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80")',
backgroundSize: 'cover',
backgroundPosition: 'center'
}}
>
<div className="absolute inset-0 bg-black bg-opacity-50"></div>
<div className="relative text-center text-white px-4 max-w-4xl mx-auto">
<h1 className="text-5xl md:text-6xl font-bold mb-6">Rescuing Food, Feeding Hope</h1>
<p className="text-xl md:text-2xl mb-8">Join us in our mission to reduce food waste and feed those in need</p>
<div className="space-y-4">
<Link to="/get-involved" className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300" >
Get Involved
</Link>
<div>
<Link to="/signin" className="inline-block bg-white hover:bg-gray-100 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold transition-colors duration-300" >
Sign In
</Link>
</div>
</div>
</div>
</section>

  {/* About Us */}
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
            We're dedicated to creating a sustainable food system by rescuing surplus food and redistributing it to those in need. Our network of volunteers and partners works tirelessly to reduce food waste while addressing food insecurity in our communities.
          </p>
          <div className="flex items-center text-green-600 font-semibold cursor-pointer">
            Learn more about our impact <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* How It Works */}
  <section className="bg-gray-50 py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="text-center p-6">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4">1. Food Collection</h3>
          <p className="text-gray-600">We collect surplus food from restaurants, grocers, and farms</p>
        </div>
        <div className="text-center p-6">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4">2. Distribution</h3>
          <p className="text-gray-600">Our network ensures food reaches those who need it most</p>
        </div>
        <div className="text-center p-6">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold mb-4">3. Community Impact</h3>
          <p className="text-gray-600">Together, we create positive change in our communities</p>
        </div>
      </div>
    </div>
  </section>

  {/* Success Stories */}
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-16">Success Stories</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Success story"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">10,000 Meals Rescued</h3>
            <p className="text-gray-600">Working with local restaurants, we rescued enough food to provide 10,000 meals to families in need.</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
            alt="Community impact"
            className="w-full h-48 object-cover"
          />
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Community Partnership</h3>
            <p className="text-gray-600">Our partnership with local farms has helped reduce food waste while supporting sustainable agriculture.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Get Involved Section */}
  <section className="bg-green-600 text-white py-20 px-4">
    <div className="max-w-6xl mx-auto text-center">
      <h2 className="text-4xl font-bold mb-8">Get Involved</h2>
      <p className="text-xl mb-12 max-w-2xl mx-auto">Join our community of volunteers and supporters making a difference in food rescue and redistribution.</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white text-gray-800 rounded-lg p-8">
          <Trophy className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">Volunteer</h3>
          <p className="mb-6">Help us collect and distribute food to those in need</p>
          <Link 
            to="/get-involved"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors duration-300"
          >
            Join as Volunteer
          </Link>
        </div>
        <div className="bg-white text-gray-800 rounded-lg p-8">
          <Heart className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-4">Donate</h3>
          <p className="mb-6">Support our mission with a financial contribution</p>
          <Link 
            to="/get-involved"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-colors duration-300"
          >
            Make a Donation
          </Link>
        </div>
      </div>
    </div>
  </section>

  {/* Resources */}
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-16">Resources</h2>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="p-6 border rounded-lg">
          <BookOpen className="w-8 h-8 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-4">Food Waste Guide</h3>
          <p className="text-gray-600 mb-4">Learn how to reduce food waste in your daily life</p>
          <a href="#" className="text-green-600 font-semibold">Read More →</a>
        </div>
        <div className="p-6 border rounded-lg">
          <BookOpen className="w-8 h-8 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-4">Best Practices</h3>
          <p className="text-gray-600 mb-4">Tips for food storage and preservation</p>
          <a href="#" className="text-green-600 font-semibold">Read More →</a>
        </div>
        <div className="p-6 border rounded-lg">
          <BookOpen className="w-8 h-8 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold mb-4">Impact Reports</h3>
          <p className="text-gray-600 mb-4">See the difference we're making together</p>
          <a href="#" className="text-green-600 font-semibold">Read More →</a>
        </div>
      </div>
    </div>
  </section>

  {/* Contact Form */}
  <section className="bg-gray-50 py-20 px-4">
    <div className="max-w-3xl mx-auto">
      <h2 className="text-4xl font-bold text-center mb-16">Contact Us</h2>
      <form className="space-y-6">
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Your email"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="message">Message</label>
          <textarea
            id="message"
            rows={4}
            className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Your message"
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-300"
        >
          Send Message
        </button>
      </form>
    </div>
  </section>

  {/* Footer */}
  <footer className="bg-gray-800 text-white py-12 px-4">
    <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Food Rescue</h3>
        <p className="text-gray-400">Making a difference in our community through food rescue and redistribution.</p>
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
        <ul className="space-y-2 text-gray-400">
          <li><a href="#" className="hover:text-white">About Us</a></li>
          <li><a href="#" className="hover:text-white">How It Works</a></li>
          <li><Link to="/get-involved" className="hover:text-white">Get Involved</Link></li>
          <li><a href="#" className="hover:text-white">Resources</a></li>
        </ul>
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-4">Contact</h4>
        <ul className="space-y-2 text-gray-400">
          <li>123 Food Rescue St</li>
          <li>City, State 12345</li>
          <li>contact@foodrescue.org</li>
          <li>(555) 123-4567</li>
        </ul>
      </div>
      <div>
        <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
        <div className="flex space-x-4">
          <a href="#" className="hover:text-green-500"><Send className="w-6 h-6" /></a>
          <a href="#" className="hover:text-green-500"><Users className="w-6 h-6" /></a>
          <a href="#" className="hover:text-green-500"><Heart className="w-6 h-6" /></a>
        </div>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
      <p>&copy; 2024 Food Rescue. All rights reserved.</p>
    </div>
  </footer>
</div>
  );
}

export default HomePage;