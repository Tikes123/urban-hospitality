import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Hotel, UtensilsCrossed, Wine, Users, Calendar, BarChart3 } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Urban Hospitality</h1>
                <p className="text-xs text-green-600">SOLUTIONS</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin
              </Link>
              <Link href="/apply" className="text-gray-600 hover:text-gray-900">
                Apply Now
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900">
                Services
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Your Next Resort, Search Made Easy</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Complete hospitality management platform connecting talented professionals with premier hotels, restaurants,
            and bars across the industry.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/apply">Find Opportunities</Link>
            </Button>
            <Button size="lg" variant="outline">
              <Link href="/admin">Business Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Hotel className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Hotel Management</CardTitle>
                <CardDescription>
                  Complete hotel operations management including staff scheduling, guest services, and facility
                  management.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <UtensilsCrossed className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Restaurant Operations</CardTitle>
                <CardDescription>
                  Full-service restaurant management from kitchen operations to front-of-house coordination and customer
                  service.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Wine className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Bar & Beverage</CardTitle>
                <CardDescription>
                  Specialized bar management services including mixology, inventory management, and customer experience.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Candidate Management</CardTitle>
                <CardDescription>
                  Advanced applicant tracking system with filtering, scheduling, and comprehensive candidate profiles.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Calendar className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Intelligent scheduling system for interviews, shifts, and staff management across multiple outlets.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>
                  Comprehensive analytics and reporting tools to track performance, hiring metrics, and business
                  insights.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Hospitality Business?</h2>
          <p className="text-xl mb-8">
            Join hundreds of successful hospitality businesses using our platform to streamline operations and find top
            talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              <Link href="/admin">Start Managing</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-green-600 bg-transparent"
            >
              <Link href="/apply">Apply for Jobs</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">U</span>
                </div>
                <span className="font-bold">Urban Hospitality</span>
              </div>
              <p className="text-gray-400">Your Next Resort, Search Made Easy</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Hotel Management</li>
                <li>Restaurant Operations</li>
                <li>Bar Services</li>
                <li>Staff Training</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Admin Dashboard</li>
                <li>Candidate Portal</li>
                <li>Mobile App</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>support@urbanhospitality.com</li>
                <li>+1 (555) 123-4567</li>
                <li>24/7 Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Urban Hospitality Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
