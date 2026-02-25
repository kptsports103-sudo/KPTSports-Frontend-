import { useState, useContext, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import OTPInput from '../components/OTPInput';

const OTPVerify = () => {

  const [email, setEmail] = useState('');

  const [otp, setOtp] = useState('');

  const navigate = useNavigate();

  const location = useLocation();

  const { verifyOTP } = useContext(AuthContext);

  useEffect(() => {
    if (location.state) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {

   e.preventDefault();

   try {

      const user = await verifyOTP(email, otp);

      const role = location.state?.role;

      if (role === 'creator') {

        navigate('/admin/creator-dashboard', { replace: true });

      } else if (role === 'superadmin') {

        navigate('/admin/super-admin-dashboard', { replace: true });

      } else {

        navigate('/admin/dashboard', { replace: true });

      }

    } catch (error) {

     alert('Invalid OTP');

   }

 };

  return (
    <div style={{
      margin: 0,
      height: '100vh',
      backgroundImage: 'url("/verifyopt.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: 'rgba(0, 0, 0, 0.45)',
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute'
      }}>
        <div style={{
          background: '#ffffff',
          width: '380px',
          padding: '32px',
          borderRadius: '14px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#0F172A', marginBottom: '12px' }}>Verify OTP</h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>
            We've sent a verification code to<br />
            <span style={{ color: '#2563EB', fontWeight: '600' }}>{email}</span>
          </p>
          <form onSubmit={handleSubmit}>
            <OTPInput value={otp} onChange={(e) => setOtp(e.target.value)} />
            <button type="submit" style={{
              width: '100%',
              padding: '12px',
              background: '#2563EB',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.target.style.background = '#1D4ED8'}
            onMouseOut={(e) => e.target.style.background = '#2563EB'}
            >Verify</button>
          </form>
        </div>
      </div>
    </div>
  );

};

export default OTPVerify;