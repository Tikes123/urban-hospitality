import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Hotel, UtensilsCrossed, Wine, Users, Calendar, BarChart3, ArrowLeft, CheckCircle, Star } from "lucide-react"

export default function ServicesPage() {
  const services = [
    {
      icon: Hotel,
      title: "Hotel Management",
      description:
        "Complete hotel operations management including staff scheduling, guest services, and facility management.",
      features: ["Staff Scheduling", "Guest Relations", "Facility Management", "Revenue Optimization"],
      price: "Starting at $299/month",
    },
    {
      icon: UtensilsCrossed,
      title: "Restaurant Operations",
      description: "Full-service restaurant management from kitchen operations to front-of-house coordination.",
      features: ["Kitchen Management", "Front of House", "Inventory Control", "Menu Planning"],
      price: "Starting at $199/month",
    },
    {
      icon: Wine,
      title: "Bar & Beverage",
      description:
        "Specialized bar management services including mixology, inventory management, and customer experience.",
      features: ["Mixology Training", "Inventory Management", "Customer Experience", "Event Planning"],
      price: "Starting at $149/month",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Hotel Manager",
      company: "Grand Plaza Hotel",
      content:
        "Urban Hospitality Solutions transformed our operations. Staff scheduling is now seamless and our guest satisfaction scores have improved by 40%.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Restaurant Owner",
      company: "Chen's Bistro",
      content:
        "The restaurant management system helped us reduce food waste by 30% and improve our profit margins significantly.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Bar Manager",
      company: "The Rooftop Lounge",
      content:
        "Their bar management expertise helped us create signature cocktails that became the talk of the city. Revenue increased by 50%.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-5 h-5" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">U</span>
                </div>
                <span className="font-bold">Urban Hospitality</span>
              </div>
            </Link>
            <nav className="flex space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/apply" className="text-gray-600 hover:text-gray-900">
                Apply Now
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-gray-900">
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">Our Services</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Comprehensive hospitality management solutions tailored to your business needs
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <Card key={index} className="relative overflow-hidden">
                  <CardHeader>
                    <service.icon className="w-12 h-12 text-green-600 mb-4" />
                    <CardTitle className="text-2xl">{service.title}</CardTitle>
                    <CardDescription className="text-base">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Key Features:</h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-4 border-t">
                        <Badge variant="secondary" className="mb-4">
                          {service.price}
                        </Badge>
                        <Button className="w-full bg-green-600 hover:bg-green-700">Get Started</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Services?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Users className="w-12 h-12 text-blue-600 mb-4" />
                  <CardTitle>Expert Team</CardTitle>
                  <CardDescription>
                    Our team consists of industry veterans with decades of combined experience in hospitality
                    management.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Calendar className="w-12 h-12 text-blue-600 mb-4" />
                  <CardTitle>24/7 Support</CardTitle>
                  <CardDescription>
                    Round-the-clock support to ensure your operations run smoothly without any interruptions.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
                  <CardTitle>Data-Driven Results</CardTitle>
                  <CardDescription>
                    Advanced analytics and reporting tools to track performance and optimize your business operations.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">What Our Clients Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <CardDescription className="text-base italic">"{testimonial.content}"</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-sm text-green-600">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-green-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
            <p className="text-xl mb-8">
              Contact us today to learn how our services can help you achieve your hospitality goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Schedule Consultation
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-green-600 bg-transparent"
              >
                <Link href="/apply">Join Our Network</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
