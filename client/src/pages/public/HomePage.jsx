import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listDoctorProfiles } from '../../api/doctors'
import { listEquipment } from '../../api/equipment'
import doctorImage from "../../assets/images/doctor&logo.png"
import building from "../../assets/images/building.jpg"

function DoctorSkeleton() {
  return (
    <div className="rounded-2xl border border-serenity-100 bg-white p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-14 w-14 bg-serenity-100 rounded-2xl"></div>
        <div className="h-6 w-20 bg-emerald-50 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-serenity-100 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-serenity-100 rounded mb-4"></div>
      <div className="h-4 w-2/3 bg-serenity-100 rounded mb-6"></div>
      <div className="pt-4 border-t border-serenity-100 flex items-center justify-between">
        <div className="h-4 w-20 bg-serenity-100 rounded"></div>
        <div className="h-4 w-24 bg-serenity-100 rounded"></div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const { data: doctors = [], isLoading } = useQuery({ 
    queryKey: ['doctor-profiles'], 
    queryFn: listDoctorProfiles
  })

  const { data: equipmentList = [], isLoading: isEquipmentLoading } = useQuery({
    queryKey: ['equipment-showcase'],
    queryFn: () => listEquipment({ active: true, featured: true }),
  })

  // Limit showcase to top 3 doctors and top 3 featured equipment
  const displayedDoctors = doctors.slice(0, 3)
  const displayedEquipment = equipmentList.slice(0, 3)

  // 

  return (
    <div className="min-h-screen bg-transparent  space-y-16 lg:space-y-24 pb-20 selection:bg-serenity-500 selection:text-white">

      <img 
        src={building} 
        alt="" 
        className="fixed inset-0 w-full h-screen object-cover -z-10"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          objectFit: 'cover',
          zIndex: -10
        }}
      />

      {/* Hero Section */}
      <div className="bg-red-200">
        <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-gradient-to-br from-serenity-950 via-serenity-900 to-serenity-800 text-white">
          {/* Background Decorative Glows */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-serenity-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-stretch justify-between">
            
            {/* Left Panel: Takes 100vh minimum on mobile, then angles on desktop */}
            <div className="w-full lg:w-[65%] min-h-[calc(100vh-4rem)] z-10 glass-panel rounded-none border-none shadow-md flex flex-col justify-center items-center lg:items-start px-6 sm:px-12 lg:pl-16 lg:pr-24 py-12 sm:py-16 lg:py-20 max-lg:[clip-path:none] lg:[clip-path:polygon(0_0,calc(100%-350px)_0,100%_100%,0_100%)]">
              <div className="max-w-3xl w-full mx-auto lg:mx-0 text-center lg:text-left">
                
                {/* Badge */}
                <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 sm:px-4 py-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.15em] text-serenity-100 backdrop-blur-md mb-6 sm:mb-8 animate-fade-in shadow-inner">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="truncate">Trusted Oncology Care • 10,000+ Patients Served</span>
                </div>

                {/* Headline */}
                <h1 className="max-w-4xl mb-6 animate-slide-up">
                  <span className="block text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-r from-white via-serenity-100 to-emerald-200 bg-clip-text text-transparent mb-2">
                    OncoCare
                  </span>
                  <span className="block text-xl sm:text-3xl lg:text-4xl font-semibold text-white leading-tight">
                    Let's fight Cancer together
                  </span>
                </h1>

                {/* Description */}
                <p className="max-w-2xl mx-auto lg:mx-0 text-sm sm:text-base text-serenity-50/90 leading-relaxed mb-8 animate-slide-up font-light" style={{ animationDelay: '0.15s' }}>
                  Experience world-class oncology care with 
                  <span className="text-emerald-200 font-medium"> seamless appointment booking</span>, 
                  <span className="text-emerald-200 font-medium"> real-time consultation tracking</span>, 
                  <span className="text-emerald-200 font-medium"> MMQR room reservations</span>, and 
                  <span className="text-emerald-200 font-medium"> digital health cards</span> — all in one unified portal.
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-serenity-100 font-medium">HIPAA Compliant</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-serenity-100 font-medium">24/7 Emergency Support</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="h-4 w-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-serenity-100 font-medium">Certified Oncologists</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3.5 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                  <Link 
                    to="/book" 
                    className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-white px-7 py-3.5 sm:py-4 font-semibold text-slate-900 shadow-xl shadow-slate-950/20 transition-all duration-200 hover:bg-serenity-50 hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Make Appointment</span>
                    <i className="fas fa-arrow-right text-sm transition-transform duration-200 group-hover:translate-x-1" />
                  </Link>
                  
                  <Link 
                    to="/rooms" 
                    className="group inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 sm:py-4 font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white/15 hover:border-white/30 active:scale-95"
                  >
                    <i className="fas fa-hospital text-serenity-300 transition-colors group-hover:text-white" />
                    <span>View Available Rooms</span>
                  </Link>
                </div>

              </div>
            </div>

            {/* Right Image Container: Rendered directly below the full-height left panel on mobile px-6 py-12 lg:p-0 */}
            <div className="w-full lg:w-[35%] flex items-end justify-center relative z-10 ">
              <img 
                src={doctorImage}
                alt="Oncologist with patient"
                className="w-full max-w-[22rem] sm:max-w-md lg:max-w-xl animate-slide-up transition-all duration-300 ease-in-out object-contain"
              />
            </div>

          </div>

        </section>
      </div>


      {/* Hospital Workflow Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          
          <div className="group rounded-2xl border border-serenity-100/80 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-serenity-200 hover:-translate-y-1">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-serenity-50 text-serenity-600 transition-colors group-hover:bg-serenity-600 group-hover:text-white">
              <i className="fas fa-calendar-check text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Tokens</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Book online and instantly receive digital consultation tokens for specialized 3-hour shift slots without long waiting lines.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
              <i className="fas fa-clock text-serenity-500" />
              <span>Real-time live queue tracking</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-serenity-100/80 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-serenity-200 hover:-translate-y-1">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-serenity-50 text-serenity-600 transition-colors group-hover:bg-serenity-600 group-hover:text-white">
              <i className="fas fa-qrcode text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">MMQR Room Booking</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Reserve inpatient hospitalization suites, execute deposit payments securely via MMQR, and submit e-receipts directly online.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
              <i className="fas fa-shield-alt text-emerald-500" />
              <span>Instant payment verification</span>
            </div>
          </div>

          <div className="group rounded-2xl border border-serenity-100/80 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-serenity-200 hover:-translate-y-1">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-serenity-50 text-serenity-600 transition-colors group-hover:bg-serenity-600 group-hover:text-white">
              <i className="fas fa-id-card text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Digital Health Card</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Fast check-in at reception desk with dynamic QR identification. Allow attending oncologists quick access to treatment history.
            </p>
            <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-medium text-slate-500">
              <i className="fas fa-bolt text-amber-500" />
              <span>One-tap reception verification</span>
            </div>
          </div>

        </div>
      </section>

      {/* Hospital Impact Metrics */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-serenity-900 via-serenity-850 to-serenity-800 p-8 sm:p-12 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10 divide-x-0 md:divide-x divide-white/10">
            <div className="space-y-2 px-2">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">10K+</div>
              <p className="text-xs sm:text-sm font-medium text-serenity-200 uppercase tracking-wider">Patients Served</p>
            </div>
            <div className="space-y-2 px-2">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">50+</div>
              <p className="text-xs sm:text-sm font-medium text-serenity-200 uppercase tracking-wider">Oncology Specialists</p>
            </div>
            <div className="space-y-2 px-2">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">200+</div>
              <p className="text-xs sm:text-sm font-medium text-serenity-200 uppercase tracking-wider">Inpatient Rooms</p>
            </div>
            <div className="space-y-2 px-2">
              <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">98%</div>
              <p className="text-xs sm:text-sm font-medium text-serenity-200 uppercase tracking-wider">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-serenity-600 mb-2">
              <i className="fas fa-stethoscope text-serenity-500" />
              Specialized Care Team
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Featured Oncologists</h2>
          </div>
          
          {doctors.length > 0 && (
            <Link 
              to="/doctors" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-serenity-600 hover:text-serenity-800 transition-colors group self-start sm:self-auto"
            >
              <span>View All Doctors</span>
              <i className="fas fa-arrow-right text-xs transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <DoctorSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {displayedDoctors.map((doctor) => (
              <article 
                key={doctor.id}
                className="group rounded-2xl border border-serenity-100 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-serenity-200 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-serenity-50 to-serenity-100 border border-serenity-200/50 text-xl font-bold text-serenity-700 shadow-inner">
                      {doctor.name?.slice(0, 1) || 'D'}
                    </div>
                    {doctor.acceptingNewPatients && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Accepting Patients
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-serenity-700 transition-colors mb-1">
                    {doctor.name}
                  </h3>
                  <p className="text-sm font-medium text-serenity-600 mb-4">
                    {doctor.specialty}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-2 rounded-lg mb-6">
                    <i className="fas fa-clock text-serenity-500" />
                    <span>Next Available Shift: <strong className="text-slate-700">Today</strong></span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <i className="fas fa-briefcase text-slate-400" />
                    <span>{doctor.yearsOfExperience || 5}+ yrs exp</span>
                  </div>
                  
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-serenity-600 hover:text-serenity-800 transition-colors group-hover:gap-2"
                  >
                    <span>View Schedule</span>
                    <i className="fas fa-chevron-right text-[10px]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Equipment Showcase */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200/60 pb-6">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-serenity-600 mb-2">
              <i className="fas fa-microscope text-serenity-500" />
              Advanced Technology
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Oncology Equipment Showcase</h2>
          </div>
          
          <Link 
            to="/equipment" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-serenity-600 hover:text-serenity-800 transition-colors group self-start sm:self-auto"
          >
            <span>Explore All Equipment</span>
            <i className="fas fa-arrow-right text-xs transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {isEquipmentLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <DoctorSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {displayedEquipment.map((item) => (
              <article
                key={item.id}
                className="group rounded-2xl border border-serenity-100 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:border-serenity-200 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl || "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80"}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-slate-900/70 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-serenity-700 transition-colors mb-2 line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs font-medium text-serenity-600 mb-3">
                      {[item.manufacturer, item.model].filter(Boolean).join(" • ") || item.category}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <span className="text-xs font-medium text-slate-500">
                    <i className="fas fa-check-circle text-emerald-500 mr-1" /> Hospital Active
                  </span>
                  <Link
                    to="/equipment"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-serenity-600 hover:text-serenity-800 transition-colors group-hover:gap-2"
                  >
                    <span>Details</span>
                    <i className="fas fa-chevron-right text-[10px]" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Embedded Styles for Smooth Entry Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}