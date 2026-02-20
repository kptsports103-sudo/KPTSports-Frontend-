const OTPInput = ({ value, onChange }) => {
  const handleInput = (e, index) => {
    const newValue = e.target.value;
    if (newValue.length > 1) return; // Only allow single digit

    const otpArray = value.split('');
    otpArray[index] = newValue;
    const newOtp = otpArray.join('');
    onChange({ target: { value: newOtp } });

    // Move to next input
    if (newValue && index < 5) {
      const nextInput = e.target.nextElementSibling;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      const prevInput = e.target.previousElementSibling;
      if (prevInput) prevInput.focus();
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          id={`otp-digit-${index + 1}`}
          name={`otp-digit-${index + 1}`}
          type="text"
          maxLength="1"
          value={value[index] || ''}
          onChange={(e) => handleInput(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          style={{
            width: '48px',
            height: '52px',
            fontSize: '20px',
            textAlign: 'center',
            borderRadius: '8px',
            border: '1px solid #CBD5E1',
            outline: 'none',
          }}
          onFocus={(e) => e.target.style.borderColor = '#2563EB'}
          onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
        />
      ))}
    </div>
  );
};

export default OTPInput;
