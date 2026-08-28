// src/pages/ContactPage.jsx
import { useState } from 'react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [errors, setErrors] = useState({})

  const contactCards = [
    {
      icon: 'fa-phone-volume',
      title: 'Emergency & Helplines',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      subtitle: '24/7 Priority Emergency Line',
      accent: 'from-amber-500 to-orange-500',
      lightBg: 'bg-amber-50 text-amber-600 border-amber-200/60'
    },
    {
      icon: 'fa-envelope-open-text',
      title: 'Email Communications',
      details: ['care@oncocare.com', 'support@oncocare.com'],
      subtitle: 'Typical response within 2 hours',
      accent: 'from-serenity-500 to-sky-600',
      lightBg: 'bg-sky-50 text-sky-600 border-sky-200/60'
    },
    {
      icon: 'fa-location-dot',
      title: 'Main Campus',
      details: ['123 Medical Center Drive', 'Suite 100, Healthcare District'],
      subtitle: 'Valet Parking Available',
      accent: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60'
    },
    {
      icon: 'fa-clock',
      title: 'Consultation Hours',
      details: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Sat: 9:00 AM - 2:00 PM'],
      subtitle: 'Sunday: Emergency Only',
      accent: 'from-indigo-500 to-purple-600',
      lightBg: 'bg-purple-50 text-purple-600 border-purple-200/60'
    }
  ]

  const departments = [
    { icon: 'fa-user-md', name: 'Medical Oncology', phone: '+1 (555) 111-0001' },
    { icon: 'fa-radiation', name: 'Radiation Oncology', phone: '+1 (555) 111-0002' },
    { icon: 'fa-procedures', name: 'Surgical Oncology', phone: '+1 (555) 111-0003' },
    { icon: 'fa-child', name: 'Pediatric Oncology', phone: '+1 (555) 111-0004' },
    { icon: 'fa-flask', name: 'Hematology & Labs', phone: '+1 (555) 111-0005' },
    { icon: 'fa-female', name: 'Gynecologic Oncology', phone: '+1 (555) 111-0006' }
  ]

  const faqs = [
    {
      question: 'How do I book an urgent oncology appointment?',
      answer: 'You can request an urgent appointment directly through our digital portal or by contacting our 24/7 care hotline. Priority slots are reserved daily for urgent consultations.'
    },
    {
      question: 'What insurance plans and direct billing do you accept?',
      answer: 'We accept most major national and international healthcare insurance providers. Our financial counselors can assist you in verifying coverage details prior to your visit.'
    },
    {
      question: 'Are telehealth consultations available?',
      answer: 'Yes, we provide secure HIPAA-compliant virtual consultations for initial evaluations, follow-up appointments, and second opinions.'
    },
    {
      question: 'How does the MMQR mobile payment system work?',
      answer: 'MMQR lets you pay treatment invoices seamlessly via your mobile banking app. Simply scan the generated QR code on your billing statement or digital portal.'
    }
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Full name is required'
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (formData.phone && !/^[\d\s\(\)\-+]+$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number'
    }
    if (!formData.subject.trim()) newErrors.subject = 'Please select a subject'
    if (!formData.message.trim()) {
      newErrors.message = 'Message details are required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long'
    }
    return newErrors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email'
      })
      
      setTimeout(() => setSubmitSuccess(false), 6000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans text-slate-800">
      
      {/* Dynamic Visual Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-serenity-950 to-teal-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.1),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-sky-300 border border-white/15 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                We're Online & Ready to Assist
              </div>

              <h1 className="text-4xl font-extrabold sm:text-6xl tracking-tight leading-none text-white">
                Get in Touch with Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">Care Team</span>
              </h1>

              <p className="max-w-2xl text-lg text-slate-300 leading-relaxed font-normal">
                Whether you have questions about specialized treatments, appointment schedules, or billing services, our dedicated medical support team is here for you every step of the way.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-3xl font-extrabold text-teal-300">24/7</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Emergency Medical Response</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-3xl font-extrabold text-sky-300">&lt; 2 Hrs</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Average Response Time</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-3xl font-extrabold text-emerald-300">100%</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Confidential Consultations</div>
              </div>
              <div className="p-5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <div className="text-3xl font-extrabold text-amber-300">6+</div>
                <div className="text-xs font-medium text-slate-300 mt-1">Specialized Care Centers</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Contact Cards Grid */}
      <section className="relative z-20 mx-auto max-w-7xl px-4 -mt-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {contactCards.map((info, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl border border-slate-200/80 p-6 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${info.lightBg} group-hover:scale-110 transition-transform duration-300`}>
                    <i className={`fas ${info.icon} text-xl`}></i>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    Direct
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">{info.title}</h3>
                
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-sm font-medium text-slate-700">{detail}</p>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-400">{info.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Section */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Send Us a Message</h2>
                <p className="text-sm text-slate-500 mt-1">Fill out the form below and our care team will contact you promptly.</p>
              </div>

              {submitSuccess && (
                <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3.5 animate-fade-in shadow-xs">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mt-0.5">
                    <i className="fas fa-check text-sm"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-900 text-sm">Message Sent Successfully</h4>
                    <p className="text-xs text-emerald-700 mt-0.5">Thank you for reaching out. A patient care representative will contact you within 24 hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50/50 transition-all outline-none ${
                        errors.name 
                          ? 'border-red-300 ring-2 ring-red-100 focus:bg-white' 
                          : 'border-slate-200 focus:border-serenity-500 focus:ring-4 focus:ring-serenity-500/10 focus:bg-white'
                      }`}
                      placeholder="e.g. Dr. Jane Smith"
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                        <i className="fas fa-circle-exclamation text-xs"></i>
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50/50 transition-all outline-none ${
                        errors.email 
                          ? 'border-red-300 ring-2 ring-red-100 focus:bg-white' 
                          : 'border-slate-200 focus:border-serenity-500 focus:ring-4 focus:ring-serenity-500/10 focus:bg-white'
                      }`}
                      placeholder="jane@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                        <i className="fas fa-circle-exclamation text-xs"></i>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50/50 transition-all outline-none ${
                        errors.phone 
                          ? 'border-red-300 ring-2 ring-red-100 focus:bg-white' 
                          : 'border-slate-200 focus:border-serenity-500 focus:ring-4 focus:ring-serenity-500/10 focus:bg-white'
                      }`}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                        <i className="fas fa-circle-exclamation text-xs"></i>
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50/50 transition-all outline-none ${
                        errors.subject 
                          ? 'border-red-300 ring-2 ring-red-100 focus:bg-white' 
                          : 'border-slate-200 focus:border-serenity-500 focus:ring-4 focus:ring-serenity-500/10 focus:bg-white'
                      }`}
                    >
                      <option value="">Select a subject category</option>
                      <option value="appointment">Appointment Consultation</option>
                      <option value="billing">Insurance & Billing Inquiry</option>
                      <option value="medical">Medical Records Request</option>
                      <option value="feedback">Patient Feedback</option>
                      <option value="other">General Inquiry</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                        <i className="fas fa-circle-exclamation text-xs"></i>
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Message Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl text-sm border bg-slate-50/50 transition-all outline-none resize-none ${
                      errors.message 
                        ? 'border-red-300 ring-2 ring-red-100 focus:bg-white' 
                        : 'border-slate-200 focus:border-serenity-500 focus:ring-4 focus:ring-serenity-500/10 focus:bg-white'
                    }`}
                    placeholder="Describe how we can assist you..."
                  />
                  {errors.message && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1 font-medium">
                      <i className="fas fa-circle-exclamation text-xs"></i>
                      {errors.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Preferred Contact Method
                  </label>
                  <div className="flex items-center gap-4">
                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.preferredContact === 'email' 
                        ? 'bg-serenity-50/70 border-serenity-300 text-serenity-800 font-semibold shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <i className="fas fa-envelope text-xs"></i>
                      <span className="text-xs">Email Communication</span>
                    </label>

                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                      formData.preferredContact === 'phone' 
                        ? 'bg-serenity-50/70 border-serenity-300 text-serenity-800 font-semibold shadow-xs' 
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <i className="fas fa-phone text-xs"></i>
                      <span className="text-xs">Phone Call</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-serenity-600 to-sky-700 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-serenity-600/20 transition-all hover:opacity-95 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin"></i>
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <i className="fas fa-paper-plane text-xs"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Interactive Map Component */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">Hospital Location</h3>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <i className="fas fa-map-pin text-emerald-500"></i> Main Campus
                </span>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-56 bg-slate-100">
                <iframe
                  title="Hospital Location Map"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-0.13%2C51.50%2C-0.11%2C51.52&amp;layer=mapnik"
                  className="w-full h-full border-none filter contrast-[1.05]"
                  loading="lazy"
                ></iframe>
              </div>

              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer" 
                className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <i className="fas fa-location-arrow text-serenity-600"></i>
                Get Driving Directions
              </a>
            </div>

            {/* Department Extensions Directory */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Direct Department Lines</h3>
              <div className="divide-y divide-slate-100">
                {departments.map((dept, index) => (
                  <div key={index} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center text-slate-500 group-hover:bg-serenity-50 group-hover:text-serenity-600 transition-colors">
                        <i className={`fas ${dept.icon} text-xs`}></i>
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{dept.name}</span>
                    </div>
                    <a href={`tel:${dept.phone}`} className="text-xs font-bold text-serenity-600 hover:underline">
                      {dept.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsible FAQ Section */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details key={index} className="group border-b border-slate-100 last:border-none pb-3">
                    <summary className="flex items-center justify-between cursor-pointer list-none py-1">
                      <span className="text-xs font-bold text-slate-800 pr-2">{faq.question}</span>
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-open:rotate-180 transition-transform flex-shrink-0">
                        <i className="fas fa-chevron-down text-[10px]"></i>
                      </span>
                    </summary>
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed pl-1">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  )
}