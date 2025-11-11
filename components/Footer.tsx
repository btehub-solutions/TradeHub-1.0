'use client'

import { Mail, Phone, Globe, Facebook, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  const socialLinks = [
    {
      name: 'WhatsApp',
      url: 'https://wa.me/2347045422815',
      icon: () => (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
    },
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/share/1YwxtU9UPy/?mibextid=wwXIfr',
      icon: Facebook,
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/ben-sam-oladoyin-527966233?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app',
      icon: Linkedin,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/bensamoladoyin?igsh=MTB3M281MnJ3bjdxbA%3D%3D&utm_source=qr',
      icon: Instagram,
    },
    {
      name: 'X',
      url: 'https://x.com/bensam_ola42584?s=21',
      icon: () => (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
  ]

  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 border-t border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content Container */}
        <div className="space-y-8">
          {/* Copyright and Tagline */}
          <div className="text-center space-y-2">
            <p className="text-lg font-bold text-white">
              © 2025 TradeHub — A Product of{' '}
              <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                BTEHub Solutions
              </span>
            </p>
            <p className="text-gray-300 text-base font-medium">
              Empowering Africa through AI & Digital Innovation
            </p>
          </div>

          {/* Divider */}
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-blue-600 mx-auto rounded-full"></div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <a
              href="mailto:btehubsolutions@gmail.com"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-gray-700 hover:border-blue-500 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Mail className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                btehubsolutions@gmail.com
              </span>
            </a>
            
            <a
              href="tel:+2347045422815"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-gray-700 hover:border-blue-500 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Phone className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                07045422815
              </span>
            </a>
            
            <a
              href="https://btehubsolutions.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-gray-700/50 backdrop-blur-sm border border-gray-600 hover:bg-gray-700 hover:border-blue-500 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Globe className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                btehubsolutions.vercel.app
              </span>
            </a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center items-center gap-4 pt-4">
            {socialLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gradient-to-br hover:from-blue-500 hover:to-blue-600 hover:text-white hover:border-blue-400 transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                  aria-label={social.name}
                >
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </footer>
  )
}
