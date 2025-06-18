import Link from "next/link"
import {
  FaHeart,
  FaShare,
} from "react-icons/fa"
import { BiMusic } from "react-icons/bi"

export function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4 lg:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <BiMusic className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-black">OneAmp</span>
              </div>
              <p className="text-gray-600 mb-4">The future of interactive music streaming.</p>
              <div className="flex space-x-4">
                <FaHeart className="w-5 h-5 text-gray-400 hover:text-black cursor-pointer" />
                <FaShare className="w-5 h-5 text-gray-400 hover:text-black cursor-pointer" />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-black mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#" className="hover:text-black">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-black mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#" className="hover:text-black">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-black mb-4">Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="#" className="hover:text-black">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    Status
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-black">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">© {new Date().getFullYear()} OneAmp. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-gray-600 hover:text-black text-sm">
                Terms
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black text-sm">
                Privacy
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black text-sm">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    )}