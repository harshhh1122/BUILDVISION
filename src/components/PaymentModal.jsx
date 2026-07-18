import React, { useState } from 'react';
import { CreditCard, ShieldCheck, X, Zap, Loader2, CheckCircle2 } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  onPaymentSuccess
}) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCardNumberChange = (e) => {
    // Format card number with spaces every 4 digits
    const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(val);
    }
  };

  const handleExpiryChange = (e) => {
    // Format MM/YY
    const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (val.length >= 2) {
      setExpiry(val.substring(0, 2) + '/' + val.substring(2, 4));
    } else {
      setExpiry(val);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3 || !cardName) {
      setError('Please fill in all credit card details correctly.');
      return;
    }

    setLoading(true);

    try {
      // Simulate secure bank gateway transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment authorization failed.');
      }

      // Upgrade local token
      localStorage.setItem('token', data.token);
      
      setSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-2xl relative flex flex-col gap-5 border-indigo-500/20 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          disabled={loading}
          className="absolute top-4 right-4 text-gray-500 hover:text-white cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Screen */}
        {success ? (
          <div className="flex flex-col items-center justify-center text-center py-10 gap-3">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-100 font-sans">Payment Authorized!</h3>
            <p className="text-xs text-emerald-400 font-semibold font-mono">PRO STATUS ACTIVE • UPDATING SYSTEM</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col gap-1 pr-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 font-mono flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-indigo-400" /> Upgrade License
              </span>
              <h3 className="text-base font-extrabold text-slate-100">Activate BuildVision Pro</h3>
              <p className="text-[11px] text-gray-400">
                Unlock professional blueprint exports, CAD integrations, and full-scale 1:1 camera AR Scanner.
              </p>
            </div>

            {/* Price tag */}
            <div className="bg-slate-900 border border-white/5 p-4 rounded-xl flex justify-between items-center font-mono">
              <span className="text-xs text-gray-400 font-bold uppercase">PRO LICENSE (₹4,999)</span>
              <span className="text-lg font-bold text-white">₹4,999.00</span>
            </div>

            {/* Error box */}
            {error && (
              <div className="bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-lg text-rose-300 text-[10px] font-mono">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
              
              {/* Cardholder Name */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  disabled={loading}
                  className="w-full bg-slate-900 border border-white/5 focus:border-indigo-500/50 outline-none rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 font-mono transition"
                />
              </div>

              {/* Card Number */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider">Card Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    maxLength="19"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    disabled={loading}
                    className="w-full bg-slate-900 border border-white/5 focus:border-indigo-500/50 outline-none rounded-xl pl-9 pr-3.5 py-2.5 text-white placeholder-gray-500 font-mono transition"
                  />
                </div>
              </div>

              {/* Expiry & CVC */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Expiration Date</label>
                  <input
                    type="text"
                    required
                    maxLength="5"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    disabled={loading}
                    className="w-full bg-slate-900 border border-white/5 focus:border-indigo-500/50 outline-none rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 font-mono transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-gray-400 uppercase tracking-wider">Security Code (CVC)</label>
                  <input
                    type="password"
                    required
                    maxLength="3"
                    placeholder="•••"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/gi, ''))}
                    disabled={loading}
                    className="w-full bg-slate-900 border border-white/5 focus:border-indigo-500/50 outline-none rounded-xl px-3.5 py-2.5 text-white placeholder-gray-500 font-mono transition"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl mt-3 cursor-pointer shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/35 transition flex items-center justify-center gap-1.5 disabled:opacity-50 font-sans"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    Authorizing Gateway...
                  </>
                ) : (
                  'Authorize Secure Payment'
                )}
              </button>
            </form>

            {/* Badges footer */}
            <div className="border-t border-white/5 pt-3.5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Secure 256-bit AES Encryption
              </span>
              <span>Powered by Stripe Demo</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
