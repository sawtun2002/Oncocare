import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listDoctorProfiles } from '../../api/doctors'

// Dummy data for fallback - Fixed education to be a string
const dummyDoctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Medical Oncology",
    yearsOfExperience: 15,
    acceptingNewPatients: true,
    education: "MD, Harvard Medical School", // Now a string
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
    education: "MD, Stanford University", // Now a string
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
    education: "MD, Johns Hopkins University", // Now a string
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
    education: "MD, Yale University", // Now a string
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
    education: "MD, University of Pennsylvania", // Now a string
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
    education: "MD, Columbia University", // Now a string
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-serenity-50/50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-serenity-900 via-serenity-800 to-serenity-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="mb-3 font-semibold tracking-[0.18em] text-serenity-200 animate-fade-in">OUR DOCTORS</p>   
          <h1 className="max-w-2xl text-4xl font-bold text-white mb-4 animate-slide-up">Meet Our Expert Team</h1>
          <p className="max-w-2xl text-lg leading-8 text-serenity-100/90 animate-slide-up" style={{animationDelay: '0.1s'}}>
            Our team of dedicated oncology specialists is committed to providing compassionate care and innovative treatment solutions. Get to know the professionals who are here to support you on your journey.
          </p>
          
          {/* Stats */}
          <div className="mt-8 flex gap-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div>
              <div className="text-3xl font-bold">{doctors.length}+</div>
              <div className="text-sm text-serenity-200">Specialists</div>
            </div>
            <div>
              <div className="text-3xl font-bold">15+</div>
              <div className="text-sm text-serenity-200">Years Experience</div>
            </div>
            <div>
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-serenity-200">Patient Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-serenity-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="w-full lg:max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search doctors by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-serenity-200 focus:border-serenity-500 focus:ring-2 focus:ring-serenity-200 outline-none transition-all"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-serenity-400"></i>
              </div>
            </div>

            {/* Specialty Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {specialties.map(specialty => (
                <button
                  key={specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedSpecialty === specialty
                      ? 'bg-serenity-600 text-white shadow-md'
                      : 'bg-serenity-50 text-serenity-700 hover:bg-serenity-100'
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-10 pr-10 py-2.5 rounded-xl border border-serenity-200 focus:border-serenity-500 focus:ring-2 focus:ring-serenity-200 outline-none transition-all bg-white cursor-pointer"
              >
                <option value="rating">Sort by Rating</option>
                <option value="experience">Sort by Experience</option>
                <option value="name">Sort by Name</option>
              </select>
              <i className="fas fa-sort absolute left-3 top-1/2 -translate-y-1/2 text-serenity-400 pointer-events-none"></i>
              <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-serenity-400 pointer-events-none text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <DoctorSkeleton key={i} />
            ))}
          </div>
        ) : filteredDoctors.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredDoctors.map((doctor) => (
                <article 
                  key={doctor.id}
                  className="group relative rounded-2xl border border-serenity-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100">
                    <i className="fas fa-star text-yellow-400 text-xs"></i>
                    <span className="text-sm font-semibold text-serenity-900">{doctor.rating}</span>
                    <span className="text-xs text-serenity-500">({doctor.reviewCount})</span>
                  </div>

                  {/* Doctor Info */}
                  <div className="mb-4 flex items-center gap-4">
                    {doctor.image ? (
                      <img
                        src={doctor.image}
                        alt={doctor.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-serenity-200"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-serenity-100 to-serenity-200 flex items-center justify-center text-2xl font-bold text-serenity-700">
                        {doctor.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'D'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-serenity-900 group-hover:text-serenity-700 transition-colors">
                        {doctor.name}
                      </h3>
                      <p className="text-sm font-medium text-serenity-500">{doctor.specialty}</p>
                      <p className="text-xs text-serenity-400">{typeof doctor.education === 'string' ? doctor.education : 'MD'}</p>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-serenity-600 mb-4 line-clamp-2">
                    {doctor.bio}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-serenity-600">
                      <i className="fas fa-briefcase text-serenity-400 w-5"></i>
                      <span>{doctor.yearsOfExperience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-serenity-600">
                      <i className="fas fa-clock text-serenity-400 w-5"></i>
                      <span>Next available: {doctor.nextAvailable}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-serenity-600">
                      <i className="fas fa-language text-serenity-400 w-5"></i>
                      <span>{doctor.languages?.join(', ') || 'English'}</span>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg font-bold text-serenity-900">${doctor.consultationFee}</span>
                      <span className="text-sm text-serenity-500"> / consultation</span>
                    </div>
                    {doctor.acceptingNewPatients && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 border border-green-200">
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        Available
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4 border-t border-serenity-100">
                    <Link
                      to={`/doctors/${doctor.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-serenity-600 text-white px-4 py-2.5 text-sm font-semibold hover:bg-serenity-700 transition-colors"
                    >
                      View Profile
                      <i className="fas fa-arrow-right text-xs"></i>
                    </Link>
                    <Link
                      to={`/doctors/${doctor.id}/book`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-serenity-200 text-serenity-700 px-4 py-2.5 text-sm font-semibold hover:bg-serenity-50 transition-colors"
                    >
                      <i className="fas fa-calendar-plus text-xs"></i>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <i className="fas fa-user-md text-6xl text-serenity-200 mb-4"></i>
            <h3 className="text-xl font-semibold text-serenity-900 mb-2">No doctors found</h3>
            <p className="text-serenity-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OurDoctorsPage