
import React, { useEffect, useState } from 'react';
import { UserRole, Profile } from '../types';
import { fetchProfiles, deleteProfileEntry, supabaseUrl, supabaseKey, supabase } from '../services/supabase';
import { createClient } from '@supabase/supabase-js';
import { Users, Plus, Shield, User, Trash2, Lock, Loader2, AlertCircle, Wrench, KeyRound } from 'lucide-react';

interface SettingsPageProps {
    currentUserRole?: UserRole;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentUserRole }) => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newUser, setNewUser] = useState({
        email: '',
        full_name: '',
        role: UserRole.Operator,
        password: ''
    });

    // Check if current user is admin
    const isAdmin = currentUserRole === UserRole.Admin;

    const getErrorMessage = (err: any): string => {
        if (typeof err === 'string') return err;
        return err?.message || err?.error_description || JSON.stringify(err);
    };

    const loadUsers = async () => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const data = await fetchProfiles();
            setUsers(data);
        } catch (err: any) {
            console.error("Failed to load users", err);
            // Қатені жасырмаймыз, толық көрсетеміз
            setErrorMsg(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    // --- "NUCLEAR FIX": BECOME ADMIN BUTTON ---
    const handleForceAdmin = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return alert("Сіз жүйеге кірмегенсіз.");

            // 1. Алдымен профиль бар ма тексереміз
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            let error;

            if (!profile) {
                // Профиль жоқ болса, жаңадан Админ ғып ашамыз
                const { error: insertError } = await supabase.from('profiles').insert([{
                    id: user.id,
                    email: user.email,
                    full_name: user.user_metadata?.full_name || 'Admin User',
                    role: 'admin'
                }]);
                error = insertError;
            } else {
                // Профиль бар болса, рөлін Админге ауыстырамыз
                const { error: updateError } = await supabase.from('profiles')
                    .update({ role: 'admin' })
                    .eq('id', user.id);
                error = updateError;
            }

            if (error) throw error;

            alert("Сәтті орындалды! Сіз енді АДМИНСІЗ. Жүйе қайта жүктеледі.");
            window.location.reload();

        } catch (err: any) {
            alert("Қате: " + getErrorMessage(err));
        }
    };
    // ------------------------------------------

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMsg(null);

        try {
            const tempClient = createClient(supabaseUrl, supabaseKey, {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                    detectSessionInUrl: false,
                    storageKey: `temp_signup_${Date.now()}`
                }
            });

            const { data: authData, error: authError } = await tempClient.auth.signUp({
                email: newUser.email,
                password: newUser.password,
                options: {
                    data: {
                        full_name: newUser.full_name,
                        role: newUser.role,
                    }
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                alert("Қолданушы сәтті тіркелді!");
                setIsAddingUser(false);
                setNewUser({ email: '', full_name: '', role: UserRole.Operator, password: '' });
                setTimeout(loadUsers, 1000);
            } else {
                throw new Error("Auth жүйесі жауап бермеді.");
            }

        } catch (err: any) {
            console.error(err);
            const msg = getErrorMessage(err);
            alert("Қате: " + msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm("Бұл қолданушыны өшіруге сенімдісіз бе?")) {
            try {
                await deleteProfileEntry(id);
                setUsers(users.filter(u => u.id !== id));
            } catch (err: any) {
                console.error(err);
                const msg = getErrorMessage(err);
                alert("Өшіру мүмкін болмады: " + msg);
            }
        }
    };

    const handleResetPassword = async (email: string | undefined) => {
        if (!email) {
            alert("Бұл қолданушының email-і жоқ.");
            return;
        }

        if (!window.confirm(`${email} адресіне құпия сөзді қалпына келтіру сілтемесін жіберу керек пе?`)) {
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password'
            });

            if (error) throw error;

            alert(`Сәтті! ${email} адресіне құпия сөзді қалпына келтіру сілтемесі жіберілді.`);
        } catch (err: any) {
            console.error(err);
            alert("Қате: " + getErrorMessage(err));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Қолданушыларды басқару</h1>
                    <p className="text-slate-500 mt-1">
                        {isAdmin
                            ? "Админ панелі: Барлық құқықтар берілген."
                            : "Сіз қазір Операторсыз. Админ болу үшін төмендегі батырманы басыңыз."}
                    </p>
                </div>

                <div className="flex gap-2">
                    {!isAdmin && (
                        <button
                            onClick={handleForceAdmin}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
                        >
                            <Wrench className="w-4 h-4" />
                            Админ құқығын алу (Fix)
                        </button>
                    )}

                    {isAdmin && (
                        <button
                            onClick={() => setIsAddingUser(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-stripe-accent hover:bg-stripe-accentHover text-white rounded-lg text-sm font-medium shadow-sm transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            Қолданушы қосу
                        </button>
                    )}
                </div>
            </div>

            {errorMsg && (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex flex-col gap-2 text-rose-800 text-sm">
                    <div className="flex items-center gap-2 font-bold">
                        <AlertCircle className="w-5 h-5" />
                        Деректерді жүктеу қатесі
                    </div>
                    <p>{errorMsg}</p>
                    {!isAdmin && (
                        <p className="text-rose-600 mt-1">
                            Бұл қате сіздің Админ емес екендігіңізден шығуы мүмкін. Жоғарыдағы жасыл батырманы басып көріңіз.
                        </p>
                    )}
                </div>
            )}

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Қолданушы</th>
                                <th className="px-6 py-3">Рөлі</th>
                                {isAdmin && <th className="px-6 py-3 text-right">Әрекет</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={isAdmin ? 3 : 2} className="p-6 text-center">Жүктелуде...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={isAdmin ? 3 : 2} className="p-6 text-center text-slate-500">Тізім бос.</td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{user.full_name}</div>
                                                <div className="text-xs text-slate-500">{user.email || 'Email көрсетілмеген'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.role === UserRole.Admin ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                                                <Shield className="w-3 h-3" /> Админ
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                                <Users className="w-3 h-3" /> Оператор
                                            </span>
                                        )}
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleResetPassword(user.email)}
                                                    className="text-slate-400 hover:text-blue-600 transition-colors"
                                                    title="Құпия сөзді қалпына келтіру"
                                                >
                                                    <KeyRound className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-slate-400 hover:text-rose-600 transition-colors"
                                                    title="Өшіру"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add User Modal */}
            {isAddingUser && isAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Жаңа қолданушы</h3>
                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Аты-жөні</label>
                                <input
                                    required
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-stripe-accent"
                                    value={newUser.full_name}
                                    onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email (Логин)</label>
                                <input
                                    required
                                    type="email"
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-stripe-accent"
                                    value={newUser.email || ''}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Құпия сөз (Пароль)</label>
                                <div className="relative">
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-stripe-accent pl-10"
                                        value={newUser.password || ''}
                                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                        placeholder="******"
                                    />
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                                <p className="text-xs text-slate-400 mt-1">Минимум 6 таңба</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Рөлі</label>
                                <select
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-stripe-accent"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                >
                                    <option value={UserRole.Operator}>Оператор</option>
                                    <option value={UserRole.Admin}>Админ</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => setIsAddingUser(false)}
                                    className="text-slate-500 hover:text-slate-700 px-3 py-2 text-sm"
                                >
                                    Болдырмау
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-stripe-accent text-white px-4 py-2 rounded-lg hover:bg-stripe-accentHover flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Жүктелуде...
                                        </>
                                    ) : (
                                        "Қосу"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
