// src/pages/AboutPage.jsx
import { Link } from 'react-router-dom'

export default function AboutPage() {
  const stats = [
    { icon: 'fa-users', value: '10,000+', label: 'Patients Served' },
    { icon: 'fa-user-md', value: '50+', label: 'Specialists' },
    { icon: 'fa-hospital', value: '200+', label: 'Hospital Rooms' },
    { icon: 'fa-award', value: '15+', label: 'Years of Excellence' }
  ]

  const values = [
    {
      icon: 'fa-heart',
      title: 'Compassionate Care',
      description: 'We treat every patient with empathy, dignity, and respect throughout their cancer journey.'
    },
    {
      icon: 'fa-lightbulb',
      title: 'Innovation',
      description: 'Leveraging cutting-edge technology and modern treatment approaches for better outcomes.'
    },
    {
      icon: 'fa-users',
      title: 'Patient-Centered',
      description: 'Our care model revolves around individual patient needs, preferences, and values.'
    },
    {
      icon: 'fa-shield-alt',
      title: 'Safety First',
      description: 'Maintaining the highest standards of safety and quality in all our medical services.'
    }
  ]

  const features = [
    {
      icon: 'fa-calendar-check',
      title: 'Easy Appointment Booking',
      description: 'Book consultations online with instant digital tokens and real-time availability.'
    },
    {
      icon: 'fa-qrcode',
      title: 'MMQR Payments',
      description: 'Secure and convenient mobile payments for room reservations and services.'
    },
    {
      icon: 'fa-id-card',
      title: 'Digital Health Cards',
      description: 'Dynamic QR codes for fast check-in and instant access to medical records.'
    },
    {
      icon: 'fa-clock',
      title: 'Flexible Scheduling',
      description: '3-hour shift slots designed to minimize waiting times and maximize convenience.'
    }
  ]

  const timeline = [
    {
      year: '2010',
      title: 'Foundation',
      description: 'OncoCare was founded with a vision to transform cancer care delivery.'
    },
    {
      year: '2015',
      title: 'Digital Transformation',
      description: 'Introduced digital health cards and online appointment systems.'
    },
    {
      year: '2018',
      title: 'MMQR Integration',
      description: 'Pioneered MMQR payment solutions for seamless patient transactions.'
    },
    {
      year: '2022',
      title: 'Expansion',
      description: 'Expanded to 200+ rooms and 50+ oncology specialists.'
    },
    {
      year: '2024',
      title: 'Innovation Hub',
      description: 'Launched advanced telehealth and remote monitoring capabilities.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-serenity-50/50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-serenity-900 via-serenity-800 to-serenity-600 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="mb-3 font-semibold tracking-[0.18em] text-serenity-200 animate-fade-in">
              OUR APPROACH
            </p>
            <h1 className="text-4xl font-bold sm:text-5xl mb-6 animate-slide-up">
              About OncoCare
            </h1>
            <p className="text-xl leading-8 text-serenity-100/90 animate-slide-up" style={{animationDelay: '0.1s'}}>
              We are dedicated to providing compassionate oncology care through innovative health management solutions.
            </p>
            <p className="mt-4 text-lg leading-8 text-serenity-100/80 animate-slide-up" style={{animationDelay: '0.2s'}}>
              Our mission is to make cancer care accessible, efficient, and patient-centered through technology-driven solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="text-center p-6 rounded-2xl bg-white border border-serenity-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-serenity-100">
                <i className={`fas ${stat.icon} text-xl text-serenity-600`}></i>
              </div>
              <div className="text-3xl font-bold text-serenity-900">{stat.value}</div>
              <div className="text-sm text-serenity-600 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-serenity-100 p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-100">
              <i className="fas fa-bullseye text-xl text-serenity-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-serenity-900 mb-4">Our Mission</h2>
            <p className="text-serenity-600 leading-relaxed">
              To revolutionize cancer care by integrating advanced technology with compassionate medical expertise, ensuring every patient receives timely, affordable, and personalized treatment.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-serenity-100 p-8 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-100">
              <i className="fas fa-eye text-xl text-serenity-600"></i>
            </div>
            <h2 className="text-2xl font-bold text-serenity-900 mb-4">Our Vision</h2>
            <p className="text-serenity-600 leading-relaxed">
              To become the leading digital oncology care platform, making world-class cancer treatment accessible to patients regardless of their location or circumstances.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="mb-3 font-semibold tracking-[0.18em] text-serenity-500">OUR VALUES</p>
          <h2 className="text-3xl font-bold text-serenity-900">What Drives Us</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl border border-serenity-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-100 group-hover:bg-serenity-600 transition-colors duration-300">
                <i className={`fas ${value.icon} text-xl text-serenity-600 group-hover:text-white transition-colors duration-300`}></i>
              </div>
              <h3 className="text-lg font-bold text-serenity-900 mb-2">{value.title}</h3>
              <p className="text-sm text-serenity-600 leading-relaxed">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="mb-3 font-semibold tracking-[0.18em] text-serenity-500">WHY CHOOSE US</p>
            <h2 className="text-3xl font-bold text-serenity-900">Innovative Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex gap-4 p-6 rounded-2xl border border-serenity-100 hover:border-serenity-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-100">
                    <i className={`fas ${feature.icon} text-xl text-serenity-600`}></i>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-serenity-900 mb-2">{feature.title}</h3>
                  <p className="text-serenity-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="mb-3 font-semibold tracking-[0.18em] text-serenity-500">OUR JOURNEY</p>
          <h2 className="text-3xl font-bold text-serenity-900">Milestones</h2>
        </div>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-serenity-200"></div>
          <div className="space-y-12">
            {timeline.map((item, index) => (
              <div key={index} className="relative flex items-center">
                <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                  <div className="h-4 w-4 rounded-full bg-serenity-600 border-4 border-white shadow"></div>
                </div>
                <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 ml-auto'}`}>
                  <div className="bg-white rounded-2xl border border-serenity-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                    <span className="text-sm font-bold text-serenity-500">{item.year}</span>
                    <h3 className="text-lg font-bold text-serenity-900 mt-1 mb-2">{item.title}</h3>
                    <p className="text-sm text-serenity-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-serenity-600 to-serenity-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-serenity-100 mb-8">
            Join thousands of patients who trust OncoCare for their cancer care journey.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-serenity-900 shadow-lg transition-all hover:scale-105"
            >
              Create Account
              <i className="fas fa-arrow-right"></i>
            </Link>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20"
            >
              Meet Our Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}