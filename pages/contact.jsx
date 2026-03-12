"use client";
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import { Api } from '@/service/service';

export default function ContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', mobileNumber: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if form is filled
  const isFormFilled = form.fullName && form.email && form.mobileNumber && form.message;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.fullName || !form.email || !form.mobileNumber || !form.message) {
      setError('Please fill all fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Please enter a valid email');
      return;
    }
    if (form.mobileNumber.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }
    try {
      setSubmitting(true);
      const res = await Api('post', 'contacts', form, router);
      if (res.success) {
        setSuccess('Thank you! Your message has been sent.');
        toast.success('Message sent');
        setForm({ fullName: '', email: '', mobileNumber: '', message: '' });
      } else {
        setError(res.message || 'Failed to submit');
        toast.error(res.message || 'Failed to submit');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'transparent' }}>
      {/* Global Stars Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="stars-container">
          {[...Array(60)].map((_, i) => (
            <div
              key={`global-star-${i}`}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS for Stars Animation */}
      <style jsx>{`
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle linear infinite;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .star:nth-child(3n) {
          width: 3px;
          height: 3px;
          box-shadow: 0 0 6px rgba(124, 198, 255, 0.7);
        }
        
        .star:nth-child(5n) {
          width: 4px;
          height: 4px;
          box-shadow: 0 0 8px rgba(47, 128, 255, 0.8);
        }
      `}</style>

      <main className="flex-1 relative z-10">
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-white">Contact Us</h1>
            <p className="text-gray-300 mt-3 max-w-2xl">We would love to hear from you. Fill out the form and our team will get back to you soon.</p>
          </div>
        </section>

        <section className="py-10 md:py-16">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-gray-800/40 p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white">Full Name</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} className="mt-2 w-full border border-white/30 bg-transparent rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 placeholder-gray-400" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-2 w-full border border-white/30 bg-transparent rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 placeholder-gray-400" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">Mobile Number</label>
                  <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} className="mt-2 w-full border border-white/30 bg-transparent rounded-xl text-white px-4 py-3 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400 placeholder-gray-400" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5} className="mt-2 w-full border border-white/30 bg-transparent rounded-xl px-4 py-3 focus:ring-2 focus:ring-cyan-400/30 text-white focus:border-cyan-400 placeholder-gray-400" placeholder="Write your message here..." />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                {success && <p className="text-cyan-400 text-sm">{success}</p>}
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full bg-transparent text-white border-2 border-white/50 hover:border-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-[0_8px_30px_rgba(77,163,255,0.8)] hover:shadow-[0_12px_40px_rgba(77,163,255,1)] disabled:opacity-60"
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-gray-800/40">
              <h2 className="text-xl font-semibold text-white">Get in touch</h2>
              <p className="text-gray-300 mt-2">Reach us at:</p>
              <div className="mt-4 space-y-3 text-gray-300">
                <p>Email: Mytopiadetroit@gmail.com</p>
                <p>Phone: +313-231-8760</p>
                <p>Address: 8201 8 Mile Road, Detroit, MI, USA</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}