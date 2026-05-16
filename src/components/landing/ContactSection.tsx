import React, { useState } from 'react';
import { Mail, MapPin, Phone, CheckCircle2 } from 'lucide-react';

export function ContactSection() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <section className="bg-bgDark2 pt-32 pb-20 md:pt-44" id="contact">
      <div className="content-container">
        <div className="animate-in fade-in duration-700 fill-mode-both" style={{ '--delay': '0.1s' } as React.CSSProperties}>
          <div className="flex flex-col gap-16 lg:flex-row lg:gap-24">
            <div className="lg:w-1/2">
              <span className="block-subtitle">Contact Us</span>
              <h1 className="text-primaryText mt-6 mb-6 text-4xl font-bold lg:text-5xl">Get in touch</h1>
              <p className="text-secondaryText mb-12 leading-loose">
                Have a question or want to learn more about our AI presentation platform? Fill out the form
                and our team will get back to you within 24 hours.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-bgDark3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Mail className="h-5 w-5 text-primaryColor" />
                  </div>
                  <div>
                    <h3 className="text-primaryText mb-1 font-bold">Email</h3>
                    <p className="text-secondaryText">contact@SlideFlow.ai</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-bgDark3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <MapPin className="h-5 w-5 text-primaryColor" />
                  </div>
                  <div>
                    <h3 className="text-primaryText mb-1 font-bold">Office</h3>
                    <p className="text-secondaryText">
                      123 Innovation Drive<br />San Francisco, CA 94107
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-bgDark3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <Phone className="h-5 w-5 text-primaryColor" />
                  </div>
                  <div>
                    <h3 className="text-primaryText mb-1 font-bold">Phone</h3>
                    <p className="text-secondaryText">+1 (555) 123-4567</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="bg-bgDark3 rounded-3xl p-8 sm:p-10 min-h-[500px] flex flex-col justify-center border border-mainBorderSubtler">
                {!isSubmitted ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                      <label htmlFor="name" className="text-primaryText mb-2 block font-medium">Full Name</label>
                      <input
                        type="text"
                        id="name"
                        placeholder="John Doe"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="mb-6">
                      <label htmlFor="email" className="text-primaryText mb-2 block font-medium">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        placeholder="john@example.com"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="mb-6">
                      <label htmlFor="subject" className="text-primaryText mb-2 block font-medium">Subject</label>
                      <input
                        type="text"
                        id="subject"
                        placeholder="How can we help?"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="mb-8">
                      <label htmlFor="message" className="text-primaryText mb-2 block font-medium">Message</label>
                      <textarea
                        id="message"
                        rows={5}
                        placeholder="Tell us about your project..."
                        required
                        className="form-input resize-none"
                      ></textarea>
                    </div>
                    <button type="submit" className="contained-button w-full py-3 text-lg">
                      Send Message
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in duration-500 opacity-100">
                    <div className="bg-primaryColor/20 mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                      <CheckCircle2 className="h-10 w-10 text-primaryColor" />
                    </div>
                    <h3 className="text-primaryText mb-3 text-2xl font-bold">Message sent!</h3>
                    <p className="text-secondaryText max-w-sm leading-relaxed">
                      Thank you for reaching out. We'll get back to you within 24 hours.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function OfficeLocations() {
  const offices = [
    {
      city: 'San Francisco',
      type: 'Headquarters',
      address: '123 Innovation Drive\nSan Francisco, CA 94107',
      hours: 'Mon–Fri, 9am–6pm PT',
    },
    {
      city: 'London',
      type: 'Europe',
      address: '45 Kings Road, 3rd Floor\nLondon, SW3 4ND, UK',
      hours: 'Mon–Fri, 9am–6pm GMT',
    },
    {
      city: 'Singapore',
      type: 'Asia-Pacific',
      address: '8 Marina View, #12-01\nSingapore 018960',
      hours: 'Mon–Fri, 9am–6pm SGT',
    },
  ];

  return (
    <section className="bg-bgDark2 pt-10 pb-20">
      <div className="content-container">
        <div className="animate-in fade-in duration-700 fill-mode-both mb-14 text-center" style={{ '--delay': '0.1s' } as React.CSSProperties}>
          <span className="block-subtitle">Our Offices</span>
          <h2 className="text-primaryText mt-6 mb-4 text-4xl font-bold lg:text-5xl">Find us worldwide</h2>
          <p className="text-secondaryText mx-auto max-w-2xl leading-relaxed">
            Visit one of our offices or connect with a local team member.
          </p>
        </div>
        <div className="animate-in fade-in duration-1000 fill-mode-both grid gap-6 sm:grid-cols-2 lg:grid-cols-3" style={{ '--delay': '0.2s' } as React.CSSProperties}>
          {offices.map((office) => (
            <div key={office.city} className="card group p-8">
              <div className="bg-primaryColor/15 mb-5 flex h-12 w-12 items-center justify-center rounded-xl">
                <MapPin className="h-6 w-6 text-primaryColor" />
              </div>
              <h3 className="text-primaryText mb-1 text-lg font-bold">{office.city}</h3>
              <p className="text-secondaryColor mb-3 text-sm font-bold">{office.type}</p>
              <p className="text-secondaryText mb-4 text-sm leading-relaxed whitespace-pre-line">
                {office.address}
              </p>
              <div className="text-secondaryText flex items-center gap-2 text-sm">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                  <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
                </svg>
                {office.hours}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
