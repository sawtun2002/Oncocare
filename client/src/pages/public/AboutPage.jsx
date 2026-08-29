import { Link } from 'react-router-dom'
import { useAppointmentRedirect } from '../../hooks/useAppointmentRedirect'

export default function AboutPage() {
  const handleAppointment = useAppointmentRedirect();
  const stats = [
    { icon: 'fa-users', value: '10,000+', label: 'Patients Served', detail: 'Across all oncology units' },
    { icon: 'fa-user-md', value: '50+', label: 'Expert Specialists', detail: 'Board-certified oncologists' },
    { icon: 'fa-hospital', value: '200+', label: 'Hospital Beds & Rooms', detail: 'Modern inpatient care' },
    { icon: 'fa-award', value: '15+', label: 'Years of Excellence', detail: 'Delivering trusted healthcare' }
  ]

  const values = [
    {
      icon: 'fa-heartbeat',
      title: 'Compassionate Care',
      description: 'We treat every patient with empathy, dignity, and personal dedication throughout their treatment and recovery journey.'
    },
    {
      icon: 'fa-microscope',
      title: 'Precision & Innovation',
      description: 'Leveraging cutting-edge diagnostic technology, targeted therapies, and modern clinical methods for enhanced care outcomes.'
    },
    {
      icon: 'fa-hands-helping',
      title: 'Patient-Centered Model',
      description: 'Our care pathways are designed around individual patient preferences, comfort, emotional well-being, and family support.'
    },
    {
      icon: 'fa-shield-virus',
      title: 'Safety & Quality Assurance',
      description: 'Strict adherence to international medical guidelines and safety compliance protocols across all clinical departments.'
    }
  ]

  const features = [
    {
      icon: 'fa-calendar-check',
      title: 'Instant Online Scheduling',
      description: 'Book specialist appointments with real-time slot availability, instant digital tokens, and shift scheduling.'
    },
    {
      icon: 'fa-qrcode',
      title: 'MMQR Digital Payments',
      description: 'Quick and transparent payment processing for hospital stay reservations, medical consultations, and lab services.'
    },
    {
      icon: 'fa-id-card-alt',
      title: 'Dynamic Health Pass Card',
      description: 'Instant QR check-in token providing secure, fast access to personal consultation logs and medical reports.'
    },
    {
      icon: 'fa-user-clock',
      title: 'Minimized Wait Times',
      description: 'Optimized 3-hour shift management designed to maximize consultation depth while minimizing patient waiting hours.'
    }
  ]

  const timeline = [
    {
      year: '2010',
      title: 'Foundation',
      description: 'OncoCare was established as a specialized oncology center dedicated to personalized patient support.'
    },
    {
      year: '2015',
      title: 'Digital Health Records',
      description: 'Introduced centralized electronic health records and an integrated online patient portal.'
    },
    {
      year: '2018',
      title: 'MMQR & Smart Care',
      description: 'Implemented seamless mobile payments and dynamic QR digital health identification cards.'
    },
    {
      year: '2022',
      title: 'Facility Expansion',
      description: 'Expanded clinical infrastructure to 200+ specialized beds and recruited top oncology experts.'
    },
    {
      year: '2026',
      title: 'Advanced Precision Portal',
      description: 'Launched integrated virtual triage, real-time consultation tracking, and multidisciplinary care boards.'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden bg-gradient-to-b from-serenity-900 via-serenity-800 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-serenity-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-serenity-400/30 bg-serenity-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-serenity-200 backdrop-blur-md mb-6 shadow-inner">
                <i className="fas fa-hospital-symbol text-emerald-400"></i>
                <span>About OncoCare Hospital</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] mb-6 text-white">
                Transforming Oncology Care with{' '}
                <span className="">
                  Compassion & Technology
                </span>
              </h1>

              <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-serenity-100/90 leading-relaxed font-normal mb-8">
                OncoCare combines clinical expertise with modern digital solutions to deliver accessible, efficient, and deeply personalized cancer treatment pathways.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/our-doctors"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-7 py-3.5 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <span>Meet Our Specialists</span>
                  <i className="fas fa-arrow-right text-sm"></i>
                </Link>
                 <button
                   onClick={handleAppointment}
                   className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-md hover:bg-white/10 transition-all active:scale-95"
                 >
                   <i className="fas fa-calendar-alt text-serenity-300"></i>
                   <span>Book Consultation</span>
                 </button>
              </div>
            </div>

            {/* Hero Right Visual Feature Badge */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-serenity-500/20 text-emerald-400 text-2xl border border-serenity-400/20">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Integrated Care Network</h3>
                    <p className="text-xs text-serenity-200">Multidisciplinary tumor boards and digital health management.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-sm text-serenity-100/90">
                    <i className="fas fa-check-circle text-emerald-400 mt-1 shrink-0"></i>
                    <span>Real-time appointment queuing & digital health pass</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-serenity-100/90">
                    <i className="fas fa-check-circle text-emerald-400 mt-1 shrink-0"></i>
                    <span>Instant room reservations with transparent MMQR checkout</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-serenity-100/90">
                    <i className="fas fa-check-circle text-emerald-400 mt-1 shrink-0"></i>
                    <span>24/7 dedicated oncology medical staff support</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="-mt-12 relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-50 text-serenity-700 text-xl border border-serenity-100">
                  <i className={`fas ${stat.icon}`}></i>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Verified
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
              <div className="text-sm font-bold text-slate-800 mt-1">{stat.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold tracking-widest text-serenity-700 uppercase mb-2">PURPOSE & DIRECTION</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Our Strategic Objectives</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-serenity-100/50 rounded-full blur-2xl pointer-events-none" />
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-serenity-600 text-white text-2xl shadow-md">
              <i className="fas fa-bullseye"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              To revolutionize cancer care delivery by unifying expert clinical practice with seamless health technologies. We aim to ensure every patient experiences individualized, dignified, and timely treatment throughout their healthcare journey.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none" />
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white text-2xl shadow-md">
              <i className="fas fa-eye"></i>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              To serve as a benchmark digital oncology institution globally—eliminating geographic barriers and administrative delays through integrated smart reservation systems, digital identity verification, and multi-specialist clinical access.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-slate-100/70 py-20 border-y border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-widest text-serenity-700 uppercase mb-2">CORE PRINCIPLES</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">What Drives Our Care</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-50 text-serenity-700 group-hover:bg-serenity-600 group-hover:text-white transition-colors duration-300 border border-serenity-100">
                    <i className={`fas ${value.icon} text-xl`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-semibold tracking-widest text-serenity-700 uppercase mb-2">SMART INFRASTRUCTURE</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Innovative Patient Features</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex gap-5 p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all duration-300"
            >
              <div className="flex-shrink-0">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-serenity-100 text-serenity-700 text-2xl border border-serenity-200/50">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestone Timeline */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-widest text-serenity-700 uppercase mb-2">OUR JOURNEY</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Key Hospital Milestones</h2>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Center Vertical Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-slate-200"></div>

            <div className="space-y-8 md:space-y-12">
              {timeline.map((item, index) => (
                <div key={index} className="relative flex flex-col md:flex-row items-center">
                  
                  {/* Timeline Dot Indicator */}
                  <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 items-center justify-center z-10">
                    <div className="h-5 w-5 rounded-full bg-serenity-600 border-4 border-white shadow-md"></div>
                  </div>

                  {/* Card position layout toggle */}
                  <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
                    <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all">
                      <span className="inline-block px-3 py-1 rounded-full bg-serenity-100 text-serenity-800 text-xs font-extrabold mb-2">
                        {item.year}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-serenity-900 via-serenity-800 to-slate-900 rounded-3xl p-8 sm:p-14 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Start Your Care Journey Today</h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base text-serenity-100/90 mb-8 leading-relaxed">
            Connect with board-certified oncology specialists, explore specialized hospital accommodations, or generate your digital health card in minutes.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 px-8 py-3.5 font-semibold text-slate-950 shadow-lg transition-all active:scale-95"
            >
              <span>Create Account</span>
              <i className="fas fa-arrow-right text-sm"></i>
            </Link>
            <Link
              to="/our-doctors"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
            >
              <span>Explore Specialists</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}