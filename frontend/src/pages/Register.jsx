import React, { useState } from 'react';
import { Building2, Mail, ShieldCheck, CheckCircle2, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onBackToLogin, onCompleteRegistration }) {
  const { setUser } = useAuth();
  
  // Steps: 1 = Account Details, 2 = Email Verification, 3 = Institution Details, 4 = Verification Status Gate
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Step 1 Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Step 2 Fields
  const [verificationCode, setVerificationCode] = useState('');

  // Step 3 Fields
  const [legalName, setLegalName] = useState('');
  const [institutionType, setInstitutionType] = useState('Private Un-Aided');
  const [aicteId, setAicteId] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const [officialEmail, setOfficialEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // Step 4 State
  const [createdUser, setCreatedUser] = useState(null);
  const [institutionStatus, setInstitutionStatus] = useState('pending_verification');

  // Submit Step 1: Create Account
  const handleRegisterAccount = async (e) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Use and Privacy Notice');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName,
          email,
          mobile_number: mobile,
          password,
          agree_terms: agreeTerms
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setCreatedUser(data.user);
      setMessage(`Verification code sent to ${email}!`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Step 2: Verify Email Code
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setMessage('Email verified! Please enter your institution details.');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Resend Email Code
  const handleResendCode = async () => {
    try {
      await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      setMessage('A new 6-digit verification code has been dispatched to your email.');
    } catch (err) {
      setError(err.message);
    }
  };

  // Submit Step 3: Institution Details
  const handleSaveInstitution = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // 1. Save details
      const saveRes = await fetch('/api/institution/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': createdUser.id,
          'x-user-email': email,
          'x-user-role': 'institution_user'
        },
        body: JSON.stringify({
          legal_name: legalName,
          institution_type: institutionType,
          aicte_permanent_id: aicteId,
          state,
          district,
          official_email: officialEmail || email,
          website,
          contact_number: contactNumber || mobile
        })
      });
      const saveData = await saveRes.json();
      if (!saveData.success) throw new Error(saveData.error);

      // 2. Submit for verification
      const submitRes = await fetch('/api/institution/submit-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': createdUser.id,
          'x-user-email': email
        }
      });
      const submitData = await submitRes.json();
      if (!submitData.success) throw new Error(submitData.error);

      setInstitutionStatus('pending_verification');
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Refresh Status
  const handleCheckStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/institution/verification-status', {
        headers: { 'x-user-id': createdUser.id }
      });
      const data = await res.json();
      if (data.institution) {
        setInstitutionStatus(data.institution.verification_status);
        if (data.institution.verification_status === 'verified') {
          // Successfully verified! Set active user context
          setUser({
            id: createdUser.id,
            email,
            full_name: fullName,
            role: 'institution_user',
            institution: data.institution
          });
          onCompleteRegistration();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col justify-center items-center">
      <div className="max-w-lg w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Step Indicator Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-xl mx-auto flex items-center justify-center">
            {step === 1 ? <Building2 className="w-6 h-6" /> :
             step === 2 ? <Mail className="w-6 h-6" /> :
             step === 3 ? <Building2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {step === 1 ? 'Register Institution Account' :
             step === 2 ? 'Verify Your Email Address' :
             step === 3 ? 'Institution Profile & Details' : 'Institution Verification Status'}
          </h2>
          <p className="text-xs text-slate-500">
            Step {step} of 4 • {
              step === 1 ? 'Representative Account Setup' :
              step === 2 ? 'Security & Email Authentication' :
              step === 3 ? 'AICTE Regulatory Details' : 'Scrutiny Committee Gate'
            }
          </p>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Step 1: Representative Registration */}
        {step === 1 && (
          <form onSubmit={handleRegisterAccount} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. Ramesh Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Official Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="principal@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded border-slate-300"
              />
              <label htmlFor="terms" className="text-xs text-slate-600">
                I agree to the Terms of Use and AICTE Compliance Notice.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? 'Creating Account...' : 'Continue to Email Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2 text-xs text-slate-500">
              Already registered?{' '}
              <button type="button" onClick={onBackToLogin} className="text-sky-600 font-semibold hover:underline">
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Email Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center space-y-1">
              <p className="text-xs text-slate-600">We dispatched a 6-digit code to:</p>
              <p className="font-mono font-bold text-sm text-slate-800">{email}</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1 text-center">
                Enter 6-Digit Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full p-3 text-center tracking-widest font-mono text-xl bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? 'Verifying Code...' : 'Verify Email & Proceed'}
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-xs text-sky-600 hover:underline font-semibold"
              >
                Resend verification code
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Institution Details Form */}
        {step === 3 && (
          <form onSubmit={handleSaveInstitution} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Institution Legal Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex National Institute of Technology"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Institution Type</label>
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                >
                  <option value="Private Un-Aided">Private Un-Aided</option>
                  <option value="Government">Government</option>
                  <option value="Government Aided">Government Aided</option>
                  <option value="Deemed University">Deemed University</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">AICTE Permanent ID (if any)</label>
                <input
                  type="text"
                  placeholder="1-9988776655"
                  value={aicteId}
                  onChange={(e) => setAicteId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">State</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharashtra"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">District</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai Suburban"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? 'Submitting Details...' : 'Submit Institution Details for Verification'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 4: Verification Status Gate */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className={`p-6 rounded-2xl border space-y-3 ${
              institutionStatus === 'verified'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-white shadow-xs">
                {institutionStatus === 'verified' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                ) : (
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                )}
              </div>

              <h3 className="font-bold text-base">
                {institutionStatus === 'verified' ? 'Institution Verified!' : 'Pending Official Verification'}
              </h3>

              <p className="text-xs leading-relaxed opacity-90 max-w-sm mx-auto">
                {institutionStatus === 'verified'
                  ? 'Your institution credentials have been verified by an AICTE Scrutiny Officer. You can now start regulatory filings.'
                  : 'Your institution registration details have been submitted and are queued for verification by an authorized AICTE Scrutiny Officer.'}
              </p>
            </div>

            {institutionStatus === 'verified' ? (
              <button
                onClick={handleCheckStatus}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs transition"
              >
                Proceed to Institution Dashboard
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleCheckStatus}
                  disabled={loading}
                  className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Verification Status
                </button>
                <p className="text-[11px] text-slate-400">
                  Tip for Hackathon Demo: You can log into the <strong>Official Reviewer Portal</strong> to approve this institution with one click!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
