import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listDoctorProfiles } from '../../api/doctors'
import stethoscope from "../../assets/images/stethoscope.jpg"
import logo_full from "../../assets/logo-full-verti.png"

// Dummy data for fallback
const dummyDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Medical Oncology",
    yearsOfExperience: 15,
    acceptingNewPatients: true,
    education: "MD, Harvard Medical School",
    rating: 4.9,
    reviewCount: 127,
    nextAvailable: "Today",
    languages: ["English", "Spanish"],
    image: null,
    bio: "Specializes in breast cancer and precision medicine approaches.",
    consultationFee: 150,
    schedule: [
      { day: "Monday", time: "9:00 AM - 12:00 PM" },
      { day: "Wednesday", time: "2:00 PM - 5:00 PM" },
      { day: "Friday", time: "9:00 AM - 12:00 PM" }
    ]
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Radiation Oncology",
    yearsOfExperience: 12,
    acceptingNewPatients: true,
    education: "MD, Stanford University",
    rating: 4.8,
    reviewCount: 98,
    nextAvailable: "Tomorrow",
    languages: ["English", "Mandarin"],
    image: null,
    bio: "Expert in advanced radiation therapy techniques and stereotactic radiosurgery.",
    consultationFee: 180,
    schedule: [
      { day: "Tuesday", time: "9:00 AM - 12:00 PM" },
      { day: "Thursday", time: "2:00 PM - 5:00 PM" },
      { day: "Saturday", time: "9:00 AM - 1:00 PM" }
    ]
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Surgical Oncology",
    yearsOfExperience: 18,
    acceptingNewPatients: false,
    education: "MD, Johns Hopkins University",
    rating: 4.9,
    reviewCount: 156,
    nextAvailable: "Next Week",
    languages: ["English", "Portuguese"],
    image: null,
    bio: "Specializes in minimally invasive surgical techniques for gastrointestinal cancers.",
    consultationFee: 200,
    schedule: [
      { day: "Monday", time: "2:00 PM - 5:00 PM" },
      { day: "Wednesday", time: "9:00 AM - 12:00 PM" },
      { day: "Thursday", time: "9:00 AM - 12:00 PM" }
    ]
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Hematology Oncology",
    yearsOfExperience: 10,
    acceptingNewPatients: true,
    education: "MD, Yale University",
    rating: 4.7,
    reviewCount: 84,
    nextAvailable: "Today",
    languages: ["English"],
    image: null,
    bio: "Focuses on blood cancers including leukemia, lymphoma, and multiple myeloma.",
    consultationFee: 140,
    schedule: [
      { day: "Tuesday", time: "9:00 AM - 12:00 PM" },
      { day: "Thursday", time: "2:00 PM - 5:00 PM" }
    ]
  },
  {
    id: 5,
    name: "Dr. Priya Patel",
    specialty: "Pediatric Oncology",
    yearsOfExperience: 14,
    acceptingNewPatients: true,
    education: "MD, University of Pennsylvania",
    rating: 5.0,
    reviewCount: 143,
    nextAvailable: "Tomorrow",
    languages: ["English", "Hindi", "Gujarati"],
    image: null,
    bio: "Dedicated to providing compassionate care for children with cancer and their families.",
    consultationFee: 160,
    schedule: [
      { day: "Monday", time: "9:00 AM - 12:00 PM" },
      { day: "Wednesday", time: "2:00 PM - 5:00 PM" },
      { day: "Friday", time: "2:00 PM - 5:00 PM" }
    ]
  },
  {
    id: 6,
    name: "Dr. Robert Kim",
    specialty: "Gynecologic Oncology",
    yearsOfExperience: 16,
    acceptingNewPatients: false,
    education: "MD, Columbia University",
    rating: 4.8,
    reviewCount: 112,
    nextAvailable: "Next Week",
    languages: ["English", "Korean"],
    image: null,
    bio: "Specializes in ovarian, cervical, and uterine cancers with advanced surgical techniques.",
    consultationFee: 190,
    schedule: [
      { day: "Tuesday", time: "2:00 PM - 5:00 PM" },
      { day: "Thursday", time: "9:00 AM - 12:00 PM" },
      { day: "Saturday", time: "9:00 AM - 12:00 PM" }
    ]
  }
]

const specialties = [
  "All Specialties",
  "Medical Oncology",
  "Radiation Oncology",
  "Surgical Oncology",
  "Hematology Oncology",
  "Pediatric Oncology",
  "Gynecologic Oncology"
]

function DoctorSkeleton() {
  return (
    <div className="rounded-2xl border border-serenity-200 bg-white p-6 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-16 w-16 bg-serenity-100 rounded-full"></div>
        <div className="h-6 w-20 bg-serenity-100 rounded-full"></div>
      </div>
      <div className="h-6 w-3/4 bg-serenity-100 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-serenity-100 rounded mb-4"></div>
      <div className="h-4 w-full bg-serenity-100 rounded mb-2"></div>
      <div className="h-4 w-2/3 bg-serenity-100 rounded mb-4"></div>
      <div className="mt-6 pt-4 border-t border-serenity-100 flex justify-between">
        <div className="h-4 w-16 bg-serenity-100 rounded"></div>
        <div className="h-4 w-24 bg-serenity-100 rounded"></div>
      </div>
    </div>
  )
}

const OurDoctorsPage = () => {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All Specialties")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")

  // Try to fetch from API, fallback to dummy data
  const { data: apiDoctors = [], isLoading } = useQuery({ 
    queryKey: ['doctor-profiles'], 
    queryFn: listDoctorProfiles,
    onError: () => {
      console.log('Using dummy data')
    }
  })

  const doctors = apiDoctors.length > 0 ? apiDoctors : dummyDoctors

  // Filter and sort doctors
  const filteredDoctors = doctors
    .filter(doctor => {
      const matchesSpecialty = selectedSpecialty === "All Specialties" || doctor.specialty === selectedSpecialty
      const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSpecialty && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating
      if (sortBy === "experience") return b.yearsOfExperience - a.yearsOfExperience
      if (sortBy === "name") return a.name.localeCompare(b.name)
      return 0
    })

  const scrollToFilters = () => {
    document.getElementById('doctor-search-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-b from-serenity-50 via-serenity-100 to-serenity-200 selection:bg-serenity-500 selection:text-white">

      
      {/* Hero Section */}
      <section 
        className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 min-h-screen" 
        style={{
          backgroundImage: `url(${stethoscope})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-serenity-400/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-0 -ml-20 w-80 h-80 rounded-full bg-emerald-300/20 blur-2xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-center lg:text-left">
             
              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6 animate-slide-up drop-shadow-sm">
                Meet the Experts <br className="hidden sm:block" />
                <span className="">
                  Behind Your Care
                </span>
              </h1>

              {/* Description */}
              <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-100 leading-relaxed mb-8 animate-slide-up font-normal" style={{ animationDelay: '0.1s' }}>
                Our team of qualified, compassionate specialists is dedicated to providing personalized oncology care, guiding you through advanced treatments with confidence and support.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <button 
                  onClick={scrollToFilters}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl glass-panel px-7 py-4 text-base font-semibold text-white shadow-lg shadow-serenity-900/30 transition-all duration-200 hover:bg-serenity-700 hover:shadow-xl active:scale-95 cursor-pointer"
                >
                  <span>Find a Doctor</span>
                  <i className="fas fa-arrow-down text-sm" />
                </button>
                
                <Link 
                  to="/book" 
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/40 bg-white/90 px-7 py-4 text-base font-semibold text-serenity-900 backdrop-blur-md transition-all duration-200 hover:bg-white active:scale-95"
                >
                  <i className="fas fa-calendar-alt text-serenity-600" />
                  <span>Book Appointment</span>
                </Link>
              </div>

              {/* Bottom Stat Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/20 max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">50+</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-200">Specialist Doctors</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">10+</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-200">Oncology Units</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">98%</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-200">Trusted Care Rate</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Sticky Filters Section */}
      <div id="doctor-search-section" className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-y border-serenity-200/80 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            
            {/* Search Input */}
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search doctors by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-serenity-500 focus:ring-2 focus:ring-serenity-200 outline-none transition-all text-slate-800 placeholder-slate-400 text-sm"
                />
                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
              </div>
            </div>

            {/* Specialty Pills */}
            <div className="flex gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
              {specialties.map(specialty => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                    selectedSpecialty === specialty
                      ? 'bg-serenity-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-serenity-100 hover:text-serenity-800'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full lg:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full lg:w-auto appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-serenity-500 focus:ring-2 focus:ring-serenity-200 outline-none transition-all text-xs sm:text-sm font-medium text-slate-700 cursor-pointer"
              >
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="name">Sort by Name</option>
              </select>
              <i className="fas fa-sort absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
            </div>

          </div>
        </div>
      </div>

      {/* Doctors Cards Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <DoctorSkeleton key={i} />
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <article 
                key={doctor.id}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div>
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                    <i className="fas fa-star text-amber-400 text-xs"></i>
                    <span className="text-xs font-semibold text-slate-800">{doctor.rating}</span>
                    <span className="text-[10px] text-slate-500">({doctor.reviewCount})</span>
                  </div>

                  {/* Doctor Info Header */}
                  <div className="mb-4 flex items-center gap-4">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-serenity-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-serenity-100 to-serenity-200 flex items-center justify-center text-xl font-bold text-serenity-800 border border-serenity-300/50">
                        {doctor.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'D'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-serenity-700 transition-colors">
                        {doctor.name}
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-serenity-600">{doctor.specialty}</p>
                      <p className="text-xs text-slate-400">{typeof doctor.education === 'string' ? doctor.education : 'MD'}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                    {doctor.bio}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                      <i className="fas fa-briefcase text-serenity-500 w-4"></i>
                      <span>{doctor.yearsOfExperience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                      <i className="fas fa-clock text-serenity-500 w-4"></i>
                      <span>Next available: <strong className="text-slate-800">{doctor.nextAvailable}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                      <i className="fas fa-language text-serenity-500 w-4"></i>
                      <span>{doctor.languages?.join(', ') || 'English'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Fee & Action */}
                <div>
                  <div className="flex items-center justify-between mb-4 pt-2">
                    <div>
                      <span className="text-lg font-extrabold text-slate-900">${doctor.consultationFee}</span>
                      <span className="text-xs text-slate-500"> / consultation</span>
                    </div>
                    {doctor.acceptingNewPatients && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Accepting Patients
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-serenity-600 text-white px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-serenity-700 transition-colors shadow-xs"
                    >
                      <span>View Profile</span>
                      <i className="fas fa-arrow-right text-[10px]"></i>
                    </Link>
                    <Link
                      to={`/doctors/${doctor.id}/book`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 text-slate-700 px-3.5 py-2.5 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors"
                      title="Book Appointment"
                    >
                      <i className="fas fa-calendar-plus"></i>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <i className="fas fa-user-md text-5xl text-slate-300 mb-4"></i>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No specialists found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search query or selecting a different specialty filter.</p>
          </div>
        )}
      </div>

    </div>
  )
}

export default OurDoctorsPage