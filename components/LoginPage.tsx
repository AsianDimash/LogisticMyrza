
import React, { useState } from 'react';
import { Truck, Lock, Mail, Loader2, User } from 'lucide-react';
import { signIn } from '../services/supabase';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn(email, password);
            onLoginSuccess();
        } catch (err: any) {
            console.error("Login Error:", err);
            const msg = err?.message || err?.error_description || (typeof err === 'string' ? err : 'Белгісіз қате орын алды.');

            if (msg.includes('Invalid login credentials')) {
                setError('Логин немесе құпия сөз қате.');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F8FA] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo Area */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#635BFF] to-[#7c74ff] flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <Truck className="w-6 h-6" strokeWidth={2.5} />
                        </div>
                        <span className="text-2xl font-bold text-slate-800 tracking-tight">
                            Logistic<span className="text-[#635BFF]">Myrza</span>
                        </span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 transition-all">
                    <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">
                        Жүйеге кіру
                    </h2>
                    <p className="text-sm text-slate-500 mb-8 text-center">Логистикалық басқару жүйесі</p>

                    {error && (
                        <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600 flex items-center justify-center text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Электронды пошта</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 rounded-lg border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-stripe-accent focus:ring-2 focus:ring-stripe-accent/20"
                                    placeholder="user@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Құпия сөз</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    className="block w-full pl-10 rounded-lg border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-slate-900 placeholder:text-gray-400 outline-none transition-all focus:bg-white focus:border-stripe-accent focus:ring-2 focus:ring-stripe-accent/20"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center rounded-lg bg-stripe-accent py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:bg-stripe-accentHover hover:shadow-indigo-300 focus:outline-none focus:ring-2 focus:ring-stripe-accent focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Кіру"
                            )}
                        </button>
                    </form>


                </div>

                <p className="mt-8 text-center text-xs text-slate-400">
                    &copy; 2023 LogisticMyrza. Барлық құқықтар қорғалған.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
