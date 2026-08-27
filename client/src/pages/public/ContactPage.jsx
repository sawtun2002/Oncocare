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

  const contactInfo = [
    {
      icon: 'fa-phone',
      title: 'Phone',
      details: ['+1 (555) 123-4567', '+1 (555) 987-6543'],
      color: 'bg-serenity-100 text-serenity-600'
    },
    {
      icon: 'fa-envelope',
      title: 'Email',
      details: ['care@oncocare.com', 'support@oncocare.com'],
      color: 'bg-serenity-100 text-serenity-600'
    },
    {
      icon: 'fa-location-dot',
      title: 'Location',
      details: ['123 Medical Center Drive', 'Suite 100, Healthcare District'],
      color: 'bg-serenity-100 text-serenity-600'
    },
    {
      icon: 'fa-clock',
      title: 'Working Hours',
      details: ['Mon - Fri: 9:00 AM - 5:00 PM', 'Sat: 9:00 AM - 1:00 PM'],
      color: 'bg-serenity-100 text-serenity-600'
    }
  ]

  const departments = [
    { icon: 'fa-user-md', name: 'Medical Oncology', phone: '+1 (555) 111-0001' },
    { icon: 'fa-radiation', name: 'Radiation Oncology', phone: '+1 (555) 111-0002' },
    { icon: 'fa-procedures', name: 'Surgical Oncology', phone: '+1 (555) 111-0003' },
    { icon: 'fa-child', name: 'Pediatric Oncology', phone: '+1 (555) 111-0004' },
    { icon: 'fa-flask', name: 'Hematology', phone: '+1 (555) 111-0005' },
    { icon: 'fa-female', name: 'Gynecologic Oncology', phone: '+1 (555) 111-0006' }
  ]

  const faqs = [
    {
      question: 'How do I book an appointment?',
      answer: 'You can book an appointment online through our portal, call our care team, or visit us in person. Online booking provides instant digital tokens for your consultation.'
    },
    {
      question: 'What insurance plans do you accept?',
      answer: 'We accept most major insurance plans. Please contact our billing department to verify your specific coverage and any out-of-pocket costs.'
    },
    {
      question: 'Do you offer emergency services?',
      answer: 'Yes, our emergency department operates 24/7. For immediate medical emergencies, please call 911 or visit our emergency room.'
    },
    {
      question: 'How does the MMQR payment system work?',
      answer: 'MMQR allows you to make secure payments using your mobile device. Simply scan the QR code provided for your service and complete the payment through your preferred mobile banking app.'
    }
  ]

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    if (formData.phone && !/^[\d\s\(\)\-]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid'
    }
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters'
    }
    return newErrors
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
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
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email'
      })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-serenity-50/50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-serenity-900 via-serenity-800 to-serenity-600 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="mb-3 font-semibold tracking-[0.18em] text-serenity-200 animate-fade-in">
            WE ARE HERE TO HELP
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl mb-6 animate-slide-up">
            Contact Us
          </h1>
          <p className="max-w-2xl text-xl leading-8 text-serenity-100/90 animate-slide-up" style={{animationDelay: '0.1s'}}>
            Get in touch with our team for support and inquiries. We're here to assist you every step of the way.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {contactInfo.map((info, index) => (
            <div 
              key={index}
              className="group bg-white rounded-2xl border border-serenity-100 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${info.color} group-hover:scale-110 transition-transform duration-300`}>
                <i className={`fas ${info.icon} text-xl`}></i>
              </div>
              <h3 className="text-lg font-bold text-serenity-900 mb-3">{info.title}</h3>
              {info.details.map((detail, idx) => (
                <p key={idx} className="text-sm text-serenity-600 mb-1">{detail}</p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-serenity-100 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-serenity-900 mb-6">Send Us a Message</h2>
              
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fade-in">
                  <i className="fas fa-check-circle text-green-500 text-xl"></i>
                  <div>
                    <p className="font-semibold text-green-800">Message sent successfully!</p>
                    <p className="text-sm text-green-600">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-serenity-900 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-serenity-200 focus:border-serenity-500 focus:ring-serenity-200'
                      } focus:ring-2 outline-none transition-all`}
                      placeholder="John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle text-xs"></i>
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-serenity-900 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-serenity-200 focus:border-serenity-500 focus:ring-serenity-200'
                      } focus:ring-2 outline-none transition-all`}
                      placeholder="john@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle text-xs"></i>
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-serenity-900 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-serenity-200 focus:border-serenity-500 focus:ring-serenity-200'
                      } focus:ring-2 outline-none transition-all`}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle text-xs"></i>
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-serenity-900 mb-2">
                      Subject *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        errors.subject ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-serenity-200 focus:border-serenity-500 focus:ring-serenity-200'
                      } focus:ring-2 outline-none transition-all bg-white`}
                    >
                      <option value="">Select a subject</option>
                      <option value="appointment">Appointment Inquiry</option>
                      <option value="billing">Billing Question</option>
                      <option value="medical">Medical Records</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <i className="fas fa-exclamation-circle text-xs"></i>
                        {errors.subject}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-serenity-900 mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.message ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-serenity-200 focus:border-serenity-500 focus:ring-serenity-200'
                    } focus:ring-2 outline-none transition-all resize-none`}
                    placeholder="Type your message here..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <i className="fas fa-exclamation-circle text-xs"></i>
                      {errors.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-serenity-900 mb-2">
                    Preferred Contact Method
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={handleInputChange}
                        className="text-serenity-600 focus:ring-serenity-500"
                      />
                      <span className="text-sm text-serenity-700">Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={handleInputChange}
                        className="text-serenity-600 focus:ring-serenity-500"
                      />
                      <span className="text-sm text-serenity-700">Phone</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-xl bg-serenity-600 px-8 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-serenity-700 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <i className="fas fa-paper-plane"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Departments */}
            <div className="bg-white rounded-2xl border border-serenity-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-serenity-900 mb-4">Departments</h3>
              <div className="space-y-3">
                {departments.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className={`fas ${dept.icon} text-serenity-500`}></i>
                      <span className="text-sm text-serenity-700">{dept.name}</span>
                    </div>
                    <span className="text-xs text-serenity-500">{dept.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="bg-white rounded-2xl border border-serenity-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-serenity-900 mb-4">Quick Answers</h3>
              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <span className="text-sm font-semibold text-serenity-700">{faq.question}</span>
                      <i className="fas fa-chevron-down text-xs text-serenity-400 group-open:rotate-180 transition-transform"></i>
                    </summary>
                    <p className="mt-2 text-sm text-serenity-600 leading-relaxed">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl border border-serenity-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-serenity-900 mb-4">Find Us</h3>
              <div className="bg-serenity-50 rounded-xl h-48 flex items-center justify-center">
                <div className="text-center">
                  <i className="fas fa-map-marker-alt text-3xl text-serenity-400 mb-2"></i>
                  <p className="text-sm text-serenity-600">Map Integration Coming Soon</p>
                </div>
              </div>
              <button className="mt-4 w-full rounded-xl border border-serenity-200 px-4 py-2.5 text-sm font-semibold text-serenity-700 hover:bg-serenity-50 transition-colors">
                <i className="fas fa-directions mr-2"></i>
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}