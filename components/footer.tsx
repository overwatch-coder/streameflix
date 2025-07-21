import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-800 py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-xl">StreamFlix</h3>
            <p className="text-gray-400 text-sm">
              Your ultimate destination for movies and TV shows. Stream unlimited content anytime, anywhere.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/movies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Movies
                </Link>
              </li>
              <li>
                <Link href="/tv-shows" className="text-gray-400 hover:text-white transition-colors text-sm">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link href="/genres" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Genres
                </Link>
              </li>
              <li>
                <Link href="/my-list" className="text-gray-400 hover:text-white transition-colors text-sm">
                  My List
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookie Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold">Account</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Settings
                </Link>
              </li>
              <li>
                <Link href="/auth/login" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© {new Date().getFullYear()} StreamFlix. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
