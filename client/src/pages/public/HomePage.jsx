import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listDoctorProfiles } from '../../api/doctors'

function LocalLoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="relative">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-serenity-200 border-t-serenity-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <i className="fas fa-heartbeat text-serenity-400 text-lg animate-pulse"></i>
        </div>
      </div>
    </div>
  )
}

function DoctorSkeleton() {
  return (
    <div className="rounded-2xl border border-serenity-200 bg-white p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-12 w-12 bg-serenity-100 rounded-full"></div>
        <div className="h-6 w-20 bg-serenity-100 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-serenity-100 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-serenity-100 rounded"></div>
      <div className="mt-6 pt-4 border-t border-serenity-100 flex justify-between">
        <div className="h-4 w-16 bg-serenity-100 rounded"></div>
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

  return (
    <div className="space-y-16 pb-16 bg-gradient-to-b from-white to-serenity-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-serenity-900 via-serenity-800 to-serenity-600 px-4 py-20 text-white">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-20 left-10 text-white/10">
          <i className="fas fa-heartbeat text-8xl"></i>
        </div>
        <div className="absolute bottom-20 right-20 text-white/5">
          <i className="fas fa-ribbon text-9xl"></i>
        </div>
        
        <div className="mx-auto max-w-7xl relative">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-in">
            <i className="fas fa-check-circle text-serenity-200"></i>
            <p className="font-semibold text-serenity-100 text-sm">
              Trusted by 10,000+ Patients
            </p>
          </div>
          
          <h1 className="max-w-3xl text-4xl font-extrabold sm:text-6xl leading-tight mb-6 animate-slide-up">
            Expert cancer care,{' '}
            <span className="text-serenity-200">centered around you.</span>
          </h1>
          
          <p className="mt-5 max-w-2xl text-lg text-serenity-100/90 leading-relaxed mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
            Book appointments, track consultation daily tokens, reserve hospitalization rooms with MMQR payment, and access digital care cards effortlessly.
          </p>
          
          <div className="mt-8 flex flex-wrap gap-4 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <Link 
              to="/book" 
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-serenity-900 shadow-lg transition-all hover:shadow-xl hover:scale-105 active:scale-95"
            >
               Make Appointment
              <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
            </Link>
            <Link 
              to="/rooms" 
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-semibold text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
            >
              <i className="fas fa-building"></i>
              View Available Rooms
            </Link>
          </div>
        </div>
      </section>

      {/* Hospital Workflow Highlights */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="group relative rounded-2xl border border-serenity-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-100 text-serenity-700 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <i className="fas fa-calendar-check text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-serenity-900 mb-2">Instant Tokens</h3>
            <p className="text-sm text-serenity-600 leading-relaxed">
              Book online and receive digital consultation tokens for specialized 3-hour shift slots (e.g., 9 AM - 12 PM).
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-serenity-500">
              <i className="fas fa-clock"></i>
              <span>Real-time availability</span>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-serenity-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-100 text-serenity-700 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <i className="fas fa-qrcode text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-serenity-900 mb-2">MMQR Room Booking</h3>
            <p className="text-sm text-serenity-600 leading-relaxed">
              Reserve inpatient hospitalization rooms, pay down payment using MMQR, and submit e-receipts directly online.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-serenity-500">
              <i className="fas fa-shield-alt"></i>
              <span>Secure payments</span>
            </div>
          </div>

          <div className="group relative rounded-2xl border border-serenity-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-serenity-100 text-serenity-700 transition-transform group-hover:scale-110 group-hover:rotate-3">
              <i className="fas fa-id-card text-xl"></i>
            </div>
            <h3 className="text-xl font-bold text-serenity-900 mb-2">Digital QR Health Card</h3>
            <p className="text-sm text-serenity-600 leading-relaxed">
              Fast check-in at reception with dynamic QR codes. Doctors quickly access historical prescriptions and records.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-serenity-500">
              <i className="fas fa-bolt"></i>
              <span>Instant check-in</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-4">
        <div className="rounded-2xl bg-gradient-to-r from-serenity-900 to-serenity-700 p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <i className="fas fa-users text-3xl text-serenity-200"></i>
              <div className="text-3xl font-bold">10K+</div>
              <div className="text-sm text-serenity-200">Patients Served</div>
            </div>
            <div className="space-y-2">
              <i className="fas fa-user-md text-3xl text-serenity-200"></i>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm text-serenity-200">Specialists</div>
            </div>
            <div className="space-y-2">
              <i className="fas fa-hospital text-3xl text-serenity-200"></i>
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm text-serenity-200">Rooms Available</div>
            </div>
            <div className="space-y-2">
              <i className="fas fa-smile text-3xl text-serenity-200"></i>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-serenity-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Doctor Showcase */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-semibold text-serenity-500 mb-2 flex items-center gap-2">
              <i className="fas fa-stethoscope"></i>
              OUR SPECIALISTS
            </p>
            <h2 className="text-3xl font-bold text-serenity-900">Oncology Medical Team</h2>
          </div>
          {doctors.length > 0 && (
            <Link 
              to="/doctors" 
              className="hidden sm:inline-flex items-center gap-2 text-serenity-600 hover:text-serenity-800 font-semibold transition-colors group"
            >
              View All Doctors
              <i className="fas fa-arrow-right transition-transform group-hover:translate-x-1"></i>
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
            {doctors?.map((doctor) => (
              <article 
                key={doctor.id}
                className="group relative rounded-2xl border border-serenity-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1">
                    <i className="fas fa-star text-yellow-400 text-sm"></i>
                    <span className="text-sm font-semibold text-serenity-700">4.8</span>
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-serenity-100 to-serenity-200 text-xl font-bold text-serenity-700">
                    {doctor.name?.slice(0, 1) || 'D'}
                  </div>
                  {doctor.acceptingNewPatients && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                      <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                      Available
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-serenity-900 mb-1">{doctor.name}</h3>
                <p className="text-sm font-medium text-serenity-500 mb-2">{doctor.specialty}</p>
                
                <div className="flex items-center gap-2 text-sm text-serenity-600 mb-4">
                  <i className="fas fa-clock text-serenity-400"></i>
                  <span>Next available: Today</span>
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t border-serenity-100 pt-4">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-briefcase text-serenity-400"></i>
                    <span className="text-xs text-serenity-600">{doctor.yearsOfExperience} years exp</span>
                  </div>
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="inline-flex items-center gap-1 text-sm font-semibold text-serenity-500 hover:text-serenity-700 transition-all group-hover:gap-2"
                  >
                    View Schedule
                    <i className="fas fa-arrow-right text-xs"></i>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Mobile View All Link */}
        {doctors.length > 0 && (
          <div className="mt-6 text-center sm:hidden">
            <Link 
              to="/doctors" 
              className="inline-flex items-center gap-2 text-serenity-600 hover:text-serenity-800 font-semibold"
            >
              View All Doctors
              <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        )}
      </section>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  )
}