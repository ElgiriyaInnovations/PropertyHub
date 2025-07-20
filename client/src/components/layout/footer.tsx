import { Link } from "wouter";
import { Home, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <Home className="h-8 w-8 text-primary mr-2" />
              <h3 className="text-2xl font-bold text-primary">PropertyHub</h3>
            </div>
            <p className="text-neutral-400 mb-4">
              Your trusted platform for connecting buyers, sellers, and brokers in the real estate market.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Buyers */}
          <div>
            <h4 className="font-semibold mb-4">For Buyers</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/properties">
                  <a className="hover:text-white transition-colors">Search Properties</a>
                </Link>
              </li>
              <li>
                <Link href="/favorites">
                  <a className="hover:text-white transition-colors">Saved Searches</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Market Reports</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Buying Guide</a>
              </li>
            </ul>
          </div>

          {/* For Sellers */}
          <div>
            <h4 className="font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <Link href="/add-property">
                  <a className="hover:text-white transition-colors">List Property</a>
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Property Valuation</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Selling Tips</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Market Analytics</a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">Help Center</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400">
          <p>&copy; 2025 PropertyHub Powered By Elgiriya Innovations. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
