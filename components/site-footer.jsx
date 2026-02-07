import Link from "next/link"

const footerLinks = {
  company: [
    { href: "/", label: "Home" },
    { href: "/apply-job", label: "Apply Job" },
    { href: "/for-business", label: "For Business" },
    { href: "/contact", label: "Contact" },
    { href: "/blogs", label: "Blogs" },
  ],
  platform: [
    { href: "/vendor", label: "Vendor" },
    { href: "/apply", label: "Apply Now" },
  ],
  legal: [
    { href: "/terms", label: "Terms" },
    { href: "/privacy", label: "Privacy" },
  ],
}

export function SiteFooter() {
  const year = new Date().getFullYear()
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[var(--brand)] flex items-center justify-center text-white font-bold">
                U
              </div>
              <span className="font-bold">Urban Hospitality</span>
            </Link>
            <p className="text-gray-400 text-sm">Your Next Resort, Search Made Easy</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Site</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-white">Platform</h3>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {year} Urban Hospitality Solutions. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
