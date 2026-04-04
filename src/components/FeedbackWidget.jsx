import { useEffect, useId, useRef, useState } from 'react';
import { MessageSquareMore, Send, X } from 'lucide-react';
import './FeedbackWidget.css';

const FEEDBACK_TYPES = ['General', 'Suggestion', 'Bug Report', 'Support', 'Other'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createInitialForm = (user) => ({
  fullName: user?.name || '',
  email: user?.email || '',
  type: FEEDBACK_TYPES[0],
  otherType: '',
  message: '',
});

const FeedbackWidget = ({
  user,
  title = 'Share Your Feedback',
  description = 'We value your thoughts and suggestions and use them to improve the KPT Sports experience.',
  contextLabel = '',
  triggerLabel = 'Feedback',
  triggerClassName = '',
  useDefaultTriggerStyles = true,
  showTriggerIcon = true,
  onSubmit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(() => createInitialForm(user));
  const [errors, setErrors] = useState({});
  const firstInputRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) {
      setFormData(createInitialForm(user));
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const focusTimeout = window.setTimeout(() => firstInputRef.current?.focus(), 80);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setErrors({});
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      window.clearTimeout(focusTimeout);
    };
  }, [isOpen]);

  const openModal = () => {
    setSubmitted(false);
    setErrors({});
    setIsOpen(true);
    setFormData((current) => ({
      ...current,
      fullName: current.fullName || user?.name || '',
      email: current.email || user?.email || '',
    }));
  };

  const closeModal = () => {
    setIsOpen(false);
    setErrors({});
  };

  const clearFieldError = (fieldName) => {
    setErrors((current) => {
      if (!current[fieldName]) {
        return current;
      }

      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      ...(name === 'type' && value !== 'Other' ? { otherType: '' } : {}),
      [name]: value,
    }));
    clearFieldError(name);
    if (name === 'type' && value !== 'Other') {
      clearFieldError('otherType');
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.';
    }

    if (formData.email.trim() && !EMAIL_PATTERN.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      nextErrors.message = 'Feedback message is required.';
    }

    if (formData.type === 'Other' && !formData.otherType.trim()) {
      nextErrors.otherType = 'Please specify the feedback type.';
    }

    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        otherType: formData.otherType.trim(),
        message: formData.message.trim(),
        finalType: formData.type === 'Other' ? formData.otherType.trim() : formData.type,
      };

      if (typeof onSubmit === 'function') {
        await Promise.resolve(onSubmit(payload));
      } else {
        console.info('Feedback submitted:', payload);
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }

      setSubmitted(true);
      setErrors({});
      setFormData(createInitialForm(user));
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setErrors({
        submit: 'Unable to submit feedback right now. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerClasses = useDefaultTriggerStyles
    ? `feedback-widget__trigger ${triggerClassName}`.trim()
    : triggerClassName;

  return (
    <>
      <button type="button" className={triggerClasses} onClick={openModal}>
        {showTriggerIcon && <MessageSquareMore size={18} aria-hidden="true" />}
        <span>{triggerLabel}</span>
      </button>

      {isOpen && (
        <div className="feedback-widget__overlay" onClick={closeModal}>
          <div
            className="feedback-widget__dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <div className="feedback-widget__header">
              <div>
                {contextLabel && <p className="feedback-widget__eyebrow">{contextLabel}</p>}
                <h2 id={titleId} className="feedback-widget__title">{title}</h2>
                <p id={descriptionId} className="feedback-widget__description">
                  {description}
                </p>
              </div>
              <button
                type="button"
                className="feedback-widget__close"
                onClick={closeModal}
                aria-label="Close feedback dialog"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {submitted ? (
              <div className="feedback-widget__success" role="status" aria-live="polite">
                <div className="feedback-widget__success-icon">
                  <Send size={20} aria-hidden="true" />
                </div>
                <h3>Thank you for your feedback</h3>
                <p>
                  Your message has been submitted successfully.
                </p>
                <button type="button" className="feedback-widget__primary" onClick={closeModal}>
                  Close
                </button>
              </div>
            ) : (
              <form className="feedback-widget__form" onSubmit={handleSubmit} noValidate>
                <div className="feedback-widget__grid">
                  <div className="feedback-widget__field">
                    <label htmlFor={`${titleId}-fullName`}>Full Name</label>
                    <input
                      ref={firstInputRef}
                      id={`${titleId}-fullName`}
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={errors.fullName ? 'feedback-widget__control feedback-widget__control--error' : 'feedback-widget__control'}
                    />
                    {errors.fullName && <p className="feedback-widget__error">{errors.fullName}</p>}
                  </div>

                  <div className="feedback-widget__field">
                    <label htmlFor={`${titleId}-email`}>Email Address (Optional)</label>
                    <input
                      id={`${titleId}-email`}
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      className={errors.email ? 'feedback-widget__control feedback-widget__control--error' : 'feedback-widget__control'}
                    />
                    {errors.email && <p className="feedback-widget__error">{errors.email}</p>}
                  </div>
                </div>

                <div className="feedback-widget__field">
                  <label htmlFor={`${titleId}-type`}>Feedback Type</label>
                  <select
                    id={`${titleId}-type`}
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="feedback-widget__control"
                  >
                    {FEEDBACK_TYPES.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.type === 'Other' && (
                  <div className="feedback-widget__field">
                    <label htmlFor={`${titleId}-otherType`}>Specify Other Type</label>
                    <input
                      id={`${titleId}-otherType`}
                      name="otherType"
                      type="text"
                      value={formData.otherType}
                      onChange={handleChange}
                      placeholder="Enter custom feedback type"
                      className={errors.otherType ? 'feedback-widget__control feedback-widget__control--error' : 'feedback-widget__control'}
                    />
                    {errors.otherType && <p className="feedback-widget__error">{errors.otherType}</p>}
                  </div>
                )}

                <div className="feedback-widget__field">
                  <label htmlFor={`${titleId}-message`}>Feedback Message</label>
                  <textarea
                    id={`${titleId}-message`}
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your feedback here"
                    rows={5}
                    className={errors.message ? 'feedback-widget__control feedback-widget__control--error feedback-widget__textarea' : 'feedback-widget__control feedback-widget__textarea'}
                  />
                  {errors.message && <p className="feedback-widget__error">{errors.message}</p>}
                </div>

                {errors.submit && <p className="feedback-widget__error">{errors.submit}</p>}

                <div className="feedback-widget__actions">
                  <button type="button" className="feedback-widget__secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="feedback-widget__primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackWidget;
