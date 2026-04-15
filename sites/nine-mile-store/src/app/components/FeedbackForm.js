'use client';

import { useState, useRef, useEffect } from 'react';

export default function FeedbackForm() {
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    feedback: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const iframeRef = useRef(null);
  const formRef = useRef(null);

  // Handle iframe load event to detect form submission completion
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    
    const handleLoad = () => {
      // Only handle load events after form is submitted
      if (formSubmitted) {
        console.log('Form submission completed');
        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormSubmitted(false);
        
        // Reset form after successful submission
        setFormValues({
          firstName: '',
          lastName: '',
          mobile: '',
          feedback: ''
        });
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 5000);
      }
    };
    
    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [formSubmitted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formValues.firstName || !formValues.feedback) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    setFormSubmitted(true);
    
    // Submit the form to the iframe
    formRef.current.submit();
  };

  return (
    <section id="contact" className="py-12 bg-background-alternate">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {isSubmitted && (
            <div className="bg-status-success/10 border border-status-success p-8 rounded-sm text-center mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-status-success mb-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <h2 className="text-2xl font-serif mb-4 text-text-primary">Thank You!</h2>
              <p className="text-text-primary mb-4">Your feedback has been submitted successfully.</p>
              <p className="text-text-primary">We appreciate your input and will use it to improve our store and services.</p>
            </div>
          )}
          
          <div className="bg-background-light p-8 border border-primary/10 rounded-sm">
            <h2 className="text-3xl font-serif text-center mb-2 text-text-primary">We Want Your Feedback!</h2>
            <p className="text-center mb-8 text-text-secondary">
              Help us understand what products or services you&apos;d like to see at Nine Mile Feed & Hardware
            </p>
            
            {/* Hidden iframe for target */}
            <iframe name="hidden-iframe" style={{display: 'none'}} ref={iframeRef}></iframe>
            
            {/* Form with iframe target */}
            <form 
              action="https://formsubmit.co/jaden8914@gmail.com" 
              method="POST"
              target="hidden-iframe"
              onSubmit={handleSubmit}
              ref={formRef}
            >
              {/* FormSubmit configuration */}
              <input type="hidden" name="_next" value="https://ninemilefeed.com/?success=true" />
              <input type="hidden" name="_subject" value="New Feedback for Nine Mile Store" />
              <input type="hidden" name="_template" value="table" />
              <input type="text" name="_honey" style={{display: 'none'}} />
              <input type="hidden" name="_captcha" value="false" />
              
              <div className="mb-6">
                <label className="block text-text-primary mb-2 font-medium" htmlFor="firstName">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formValues.firstName}
                  onChange={handleChange}
                  className="w-full p-3 border border-primary/20 bg-background-light text-text-primary rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-text-primary mb-2 font-medium" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formValues.lastName}
                  onChange={handleChange}
                  className="w-full p-3 border border-primary/20 bg-background-light text-text-primary rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-text-primary mb-2 font-medium" htmlFor="mobile">
                  Mobile Number (optional)
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formValues.mobile}
                  onChange={handleChange}
                  className="w-full p-3 border border-primary/20 bg-background-light text-text-primary rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="mb-8">
                <label className="block text-text-primary mb-2 font-medium" htmlFor="feedback">
                  What products or services would you like to see at our store?
                </label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formValues.feedback}
                  onChange={handleChange}
                  rows="5"
                  className="w-full p-3 border border-primary/20 bg-background-light text-text-primary rounded-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  required
                ></textarea>
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 bg-primary hover:bg-primary-dark text-background-light rounded-sm font-medium ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
              
              <p className="mt-8 text-center text-text-secondary bg-background-main p-4 rounded-sm border border-primary/10">
                Your feedback helps us improve our store and better serve our community. Thank you!
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
} 