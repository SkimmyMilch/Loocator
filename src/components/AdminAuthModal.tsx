import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, Eye, EyeOff, X, Check, RefreshCw } from 'lucide-react';

interface AdminAuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const DEFAULT_PASSWORD = 'admin123';

export const getStoredAdminPassword = (): string => {
  return localStorage.getItem('loo_admin_password') || DEFAULT_PASSWORD;
};

export const setStoredAdminPassword = (newPassword: string): void => {
  localStorage.setItem('loo_admin_password', newPassword);
};

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // For changing password mode
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [changeSuccessMsg, setChangeSuccessMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const activePassword = getStoredAdminPassword();
    if (inputPassword === activePassword) {
      setError(null);
      localStorage.setItem('loo_is_admin_authenticated', 'true');
      onSuccess();
    } else {
      setError('Incorrect admin password.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const activePassword = getStoredAdminPassword();
    if (currentPassInput !== activePassword) {
      setError('Current password incorrect.');
      return;
    }
    if (!newPassInput.trim()) {
      setError('New password cannot be blank.');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setError('New passwords do not match.');
      return;
    }

    setStoredAdminPassword(newPassInput.trim());
    setChangeSuccessMsg('Password successfully changed!');
    setError(null);
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
    setTimeout(() => {
      setIsChangingPassword(false);
      setChangeSuccessMsg(null);
    }, 1500);
  };

  const handleResetDefault = () => {
    setStoredAdminPassword(DEFAULT_PASSWORD);
    setChangeSuccessMsg('Password reset to admin123!');
    setError(null);
    setTimeout(() => setChangeSuccessMsg(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div className="relative w-full max-w-md bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden my-auto text-black flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-yellow-400 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-black text-yellow-400 border-2 border-black">
              <ShieldCheck className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="font-display font-black text-base uppercase tracking-tight text-black">
                {isChangingPassword ? 'CHANGE ADMIN PASSWORD' : 'ADMIN AUTHENTICATION'}
              </h2>
              <p className="text-[10px] font-black uppercase text-zinc-800 tracking-wider">
                LOO.LOCATOR RESTRICTED AREA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-black bg-white hover:bg-black hover:text-white border-2 border-black font-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-400 text-black border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              ⚠️ {error}
            </div>
          )}

          {changeSuccessMsg && (
            <div className="p-3 bg-emerald-400 text-black border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{changeSuccessMsg}</span>
            </div>
          )}

          {!isChangingPassword ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-black mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>ENTER ADMIN PASSWORD</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter password..."
                    autoFocus
                    className="w-full px-3 py-2.5 bg-zinc-100 border-2 border-black text-sm font-bold text-black uppercase focus:bg-yellow-300 focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-black hover:text-zinc-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-black text-yellow-400 hover:bg-yellow-400 hover:text-black border-2 border-black font-black text-xs uppercase transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4 stroke-[2.5]" />
                  <span>UNLOCK ADMIN ACCESS</span>
                </button>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-zinc-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(true);
                    setError(null);
                  }}
                  className="text-black font-black underline hover:text-blue-600 uppercase"
                >
                  Change Password
                </button>

                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="text-zinc-600 font-bold hover:text-red-600 uppercase flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3 stroke-[2]" />
                  <span>Reset to Default</span>
                </button>
              </div>
            </form>
          ) : (
            /* Change Password Form */
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1">
                  CURRENT PASSWORD
                </label>
                <input
                  type="password"
                  value={currentPassInput}
                  onChange={(e) => setCurrentPassInput(e.target.value)}
                  placeholder="Current password..."
                  className="w-full px-3 py-2 bg-zinc-100 border-2 border-black text-xs font-bold text-black focus:bg-yellow-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1">
                  NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={newPassInput}
                  onChange={(e) => setNewPassInput(e.target.value)}
                  placeholder="New password..."
                  className="w-full px-3 py-2 bg-zinc-100 border-2 border-black text-xs font-bold text-black focus:bg-yellow-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase text-black mb-1">
                  CONFIRM NEW PASSWORD
                </label>
                <input
                  type="password"
                  value={confirmPassInput}
                  onChange={(e) => setConfirmPassInput(e.target.value)}
                  placeholder="Confirm new password..."
                  className="w-full px-3 py-2 bg-zinc-100 border-2 border-black text-xs font-bold text-black focus:bg-yellow-300 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setError(null);
                  }}
                  className="flex-1 py-2.5 bg-zinc-200 text-black border-2 border-black font-black text-xs uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-black text-white hover:bg-yellow-400 hover:text-black border-2 border-black font-black text-xs uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  SAVE NEW PASSWORD
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
