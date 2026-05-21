import React, { useState } from 'react';

interface AuthPageProps {
  onLogin: (username: string, avatar: string) => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (view === 'login') {
      if (!loginEmail) return;
      onLogin(loginEmail.split('@')[0] || "User", "");
    } else {
      if (!registerUsername) return;
      onLogin(registerUsername, "");
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[url('https://cdn.pixabay.com/photo/2018/01/14/23/12/nature-3082832_1280.jpg')] bg-cover bg-center select-none font-sans text-[#DBDEE1]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="bg-[#313338] p-8 rounded-lg shadow-2xl w-[480px] z-10 animate-in fade-in zoom-in-95 duration-300 relative flex flex-col">
        {view === 'login' ? (
          <>
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Add Account</h1>
              <p className="text-[#949BA4] text-[15px]">Logging in to another account will let you switch easily between them.</p>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#B5BAC1] uppercase mb-2">
                  Email or Phone Number <span className="text-[#F23F43]">*</span>
                </label>
                <input 
                  type="text" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-[#1E1F22] p-2.5 rounded border border-transparent focus:border-[#5865F2] outline-none text-white text-[15px] transition-colors"
                />
              </div>
              <div className="mt-4">
                <label className="block text-[12px] font-bold text-[#B5BAC1] uppercase mb-2">
                  Password <span className="text-[#F23F43]">*</span>
                </label>
                <input 
                  type="password" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  className="w-full bg-[#1E1F22] p-2.5 rounded border border-transparent focus:border-[#5865F2] outline-none text-white text-[15px] transition-colors"
                />
                <button type="button" className="text-[#00A8FC] text-xs hover:underline mt-2 text-left w-full">
                  Forgot your password?
                </button>
              </div>
              
              <div className="flex items-center justify-between mt-8 pt-8">
                <div onClick={() => setView('register')} className="text-white text-sm hover:underline cursor-pointer font-bold">
                  Back
                </div>
                <button 
                  type="submit"
                  className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-8 py-2.5 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                  disabled={!loginEmail || !loginPassword}
                >
                  Log In
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Create an account</h1>
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-[12px] font-bold text-[#B5BAC1] uppercase mb-2">
                  Email <span className="text-[#F23F43]">*</span>
                </label>
                <input 
                  type="email" 
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  autoFocus
                  required
                  className="w-full bg-[#1E1F22] p-2.5 rounded border border-transparent focus:border-[#5865F2] outline-none text-white text-[15px] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#B5BAC1] uppercase mb-2">
                  Username <span className="text-[#F23F43]">*</span>
                </label>
                <input 
                  type="text" 
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  required
                  className="w-full bg-[#1E1F22] p-2.5 rounded border border-transparent focus:border-[#5865F2] outline-none text-white text-[15px] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-[#B5BAC1] uppercase mb-2">
                  Password <span className="text-[#F23F43]">*</span>
                </label>
                <input 
                  type="password" 
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                  className="w-full bg-[#1E1F22] p-2.5 rounded border border-transparent focus:border-[#5865F2] outline-none text-white text-[15px] transition-colors"
                />
              </div>
              <div className="flex flex-col mt-8 pt-2">
                <button 
                  type="submit"
                  className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-2.5 rounded text-sm font-semibold transition-colors disabled:opacity-50"
                  disabled={!registerEmail || !registerUsername || !registerPassword}
                >
                  Continue
                </button>
                <div onClick={() => setView('login')} className="text-[#00A8FC] text-sm hover:underline cursor-pointer font-medium mt-4">
                  Already have an account?
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
