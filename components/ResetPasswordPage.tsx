
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ResetPasswordPageProps {
    onComplete: () => void;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onComplete }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError('Құпия сөздер сәйкес келмейді');
            return;
        }

        if (password.length < 6) {
            setError('Құпия сөз кемінде 6 таңба болу керек');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;

            setSuccess(true);

            // 3 секундтан кейін кіру бетіне бағыттау
            setTimeout(() => {
                onComplete();
            }, 3000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Қате орын алды');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Құпия сөз өзгертілді!</h2>
                    <p className="text-slate-500">Жүйеге кіру бетіне бағытталасыз...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-stripe-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-stripe-accent" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Жаңа құпия сөз</h2>
                    <p className="text-slate-500 text-sm mt-1">Жаңа құпия сөзді енгізіңіз</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Жаңа құпия сөз</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-stripe-accent focus:ring-2 focus:ring-stripe-accent/20"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Құпия сөзді растау</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 outline-none focus:border-stripe-accent focus:ring-2 focus:ring-stripe-accent/20"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-stripe-accent hover:bg-stripe-accentHover text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Сақталуда...
                            </>
                        ) : (
                            'Құпия сөзді өзгерту'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
