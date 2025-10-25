"use client";
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

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
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <section className="bg-[url('/images/navba.png')] bg-cover bg-center py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Contact Us</h1>
            <p className="text-gray-700 mt-3 max-w-2xl">We would love to hear from you. Fill out the form and our team will get back to you soon.</p>
          </div>
        </section>

        <section className="py-10 md:py-16">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input name="fullName" value={form.fullName} onChange={handleChange} className="mt-2 w-full border border-gray-200 rounded-xl text-gray-600 px-4 py-3 focus:ring-2 focus:ring-[#80A6F7]/30 focus:border-[#80A6F7]" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className="mt-2 w-full border border-gray-200 rounded-xl text-gray-700 px-4  py-3 focus:ring-2 focus:ring-[#80A6F7]/30 focus:border-[#80A6F7]" placeholder="you@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input name="mobileNumber" value={form.mobileNumber} onChange={handleChange} className="mt-2 w-full border border-gray-200 rounded-xl text-gray-600 px-4 py-3 focus:ring-2 focus:ring-[#80A6F7]/30 focus:border-[#80A6F7]" placeholder="9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={5} className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#80A6F7]/30 text-gray-600 focus:border-[#80A6F7]" placeholder="Write your message here..." />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">{success}</p>}
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className={`w-full ${isFormFilled ? 'bg-[#6f95ee]' : 'bg-[#80A6F7]'} hover:bg-[#5f85dd] text-white font-semibold py-3 rounded-xl transition disabled:opacity-60`}
                >
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            <div className="bg-gradient-to-b from-[#80A6F7]/10 to-[#80A6F7]/5 rounded-2xl p-6 md:p-8 border border-[#80A6F7]/20">
              <h2 className="text-xl font-semibold text-gray-900">Get in touch</h2>
              <p className="text-gray-600 mt-2">Reach us at:</p>
              <div className="mt-4 space-y-3 text-gray-700">
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