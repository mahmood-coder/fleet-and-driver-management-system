'use client';

import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Users, 
  ClipboardList, 
  MapPin, 
  Settings, 
  LogOut, 
  UserCheck, 
  Plus, 
  Star, 
  Compass, 
  Clock, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Phone,
  Radio,
  Search,
  ChevronLeft,
  X,
  Gauge,
  ExternalLink
} from 'lucide-react';

export default function AppMain() {
  // Session User
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Tabs: 'dashboard' | 'duties' | 'vehicles' | 'drivers' | 'gps'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Core Data Lists
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [vehiclesList, setVehiclesList] = useState<any[]>([]);
  const [dutiesList, setDutiesList] = useState<any[]>([]);
  const [selectedVehicleGpsLogs, setSelectedVehicleGpsLogs] = useState<any[]>([]);
  const [selectedGpsVehicleId, setSelectedGpsVehicleId] = useState<number | null>(null);

  // Loading, Errors, Search, Filters
  const [isLoading, setIsLoading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals / Form toggles
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCompleteDutyModal, setShowCompleteDutyModal] = useState<number | null>(null);

  // Forms states
  const [loginForm, setLoginForm] = useState({ username: 'admin', password: '123' });
  const [registerForm, setRegisterForm] = useState({ username: '', password: '', name: '', role: 'driver', phone: '' });
  const [vehicleForm, setVehicleForm] = useState({ plateNumber: '', model: '', gpsEnabled: true, gpsType: 'phone', rating: 5, notes: '' });
  const [dutyForm, setDutyForm] = useState({ driverId: '', vehicleId: '', dutyType: '' });
  const [userForm, setUserForm] = useState({ username: '', password: '', name: '', role: 'viewer', phone: '' });
  const [completeForm, setCompleteForm] = useState({ driverRating: '5', vehicleRating: '5', feedback: '' });

  // Map simulation state
  const [simulatedLat, setSimulatedLat] = useState(24.7136);
  const [simulatedLng, setSimulatedLng] = useState(46.6753);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('fleet_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('fleet_user');
      }
    }
  }, []);

  // Fetch Dashboard Data whenever user or activeTab changes
  const fetchData = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/dashboard?role=${currentUser.role}&driverId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setAllUsers(data.users || []);
        setVehiclesList(data.vehicles || []);
        setDutiesList(data.duties || []);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Seed Helper
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess("تم تهيئة قاعدة البيانات بالبيانات النموذجية بنجاح!");
        fetchData();
      } else {
        setErrorMessage(data.error || "فشل تهيئة البيانات");
      }
    } catch (e) {
      setErrorMessage("حدث خطأ أثناء تهيئة البيانات");
    } finally {
      setIsSeeding(false);
    }
  };

  const showTemporarySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Auth: Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('fleet_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        showTemporarySuccess(`أهلاً بك، ${data.user.name}`);
      } else {
        setErrorMessage(data.error || 'اسم المستخدم أو كلمة المرور خاطئة');
      }
    } catch (error) {
      setErrorMessage('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: Register (Public or Admin)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      });
      const data = await res.json();
      if (data.success) {
        // If registering self
        localStorage.setItem('fleet_user', JSON.stringify(data.user));
        setCurrentUser(data.user);
        showTemporarySuccess(`تم إنشاء الحساب بنجاح! مرحباً ${data.user.name}`);
      } else {
        setErrorMessage(data.error || 'فشل التسجيل');
      }
    } catch (error) {
      setErrorMessage('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  // Create User by Admin
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userForm)
      });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess(`تم إضافة المستخدم الجديد "${userForm.name}" بنجاح!`);
        setShowUserModal(false);
        setUserForm({ username: '', password: '', name: '', role: 'viewer', phone: '' });
        fetchData();
      } else {
        alert(data.error || 'فشل إضافة المستخدم');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الإرسال');
    } finally {
      setIsLoading(false);
    }
  };

  // Create Vehicle
  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vehicleForm)
      });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess(`تم إضافة المركبة ذات اللوحة ${vehicleForm.plateNumber} بنجاح!`);
        setShowVehicleModal(false);
        setVehicleForm({ plateNumber: '', model: '', gpsEnabled: true, gpsType: 'phone', rating: 5, notes: '' });
        fetchData();
      } else {
        alert(data.error || 'خطأ في إضافة المركبة');
      }
    } catch (error) {
      alert('حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  };

  // Update GPS toggle
  const toggleVehicleGps = async (vehicleId: number, currentEnabled: boolean, type: string) => {
    try {
      const res = await fetch('/api/vehicles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vehicleId,
          gpsEnabled: !currentEnabled,
          gpsType: type
        })
      });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess(`تم ${!currentEnabled ? 'تفعيل' : 'إلغاء تفعيل'} نظام الـ GPS للمركبة بنجاح!`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Create/Assign Duty
  const handleCreateDuty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/duties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dutyForm)
      });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess("تم إسناد الواجب للمركبة والسائق بنجاح وإرسال الإشعار له!");
        setShowDutyModal(false);
        setDutyForm({ driverId: '', vehicleId: '', dutyType: '' });
        fetchData();
      } else {
        alert(data.error || 'خطأ في إسناد المهمة');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الإرسال');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Duty
  const handleDeleteDuty = async (dutyId: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذه المهمة؟')) return;
    try {
      const res = await fetch(`/api/duties/delete?id=${dutyId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess("تم حذف المهمة بنجاح");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (vId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه المركبة؟')) return;
    try {
      const res = await fetch(`/api/vehicles/delete?id=${vId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess("تم حذف المركبة بنجاح");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Driver Actions: Start Duty (انطلقت المهمة)
  const handleStartDuty = async (dutyId: number) => {
    try {
      const res = await fetch('/api/duties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: dutyId, status: 'running' })
      });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess("انطلقت المهمة! بدأ حساب الوقت والـ GPS الآن.");
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Driver Actions: End Duty and return to Garage (انتهت المهمة والعودة للكراج)
  const handleCompleteDuty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCompleteDutyModal) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/duties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: showCompleteDutyModal,
          status: 'completed',
          driverRating: completeForm.driverRating,
          vehicleRating: completeForm.vehicleRating,
          feedback: completeForm.feedback
        })
      });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess("تم إنهاء المهمة بنجاح وحساب إجمالي الساعات المستغرقة!");
        setShowCompleteDutyModal(null);
        setCompleteForm({ driverRating: '5', vehicleRating: '5', feedback: '' });
        fetchData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Driver Action: Send simulated GPS update
  const handleSendGpsUpdate = async (dutyId: number, vehicleId: number) => {
    // Generate slight random coordinate shifts around Riyadh to simulate actual movement
    const newLat = simulatedLat + (Math.random() - 0.5) * 0.01;
    const newLng = simulatedLng + (Math.random() - 0.5) * 0.01;
    setSimulatedLat(newLat);
    setSimulatedLng(newLng);

    try {
      const res = await fetch('/api/duties', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dutyId,
          latitude: newLat,
          longitude: newLng
        })
      });
      const data = await res.json();
      if (data.success) {
        showTemporarySuccess(`تم إرسال إحداثيات الموقع بنجاح! (${newLat.toFixed(4)}, ${newLng.toFixed(4)})`);
        fetchData();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // View Vehicle GPS Route Logs
  const handleViewGpsLogs = async (vId: number) => {
    setSelectedGpsVehicleId(vId);
    try {
      const res = await fetch(`/api/gps?vehicleId=${vId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedVehicleGpsLogs(data.logs || []);
        setActiveTab('gps');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('fleet_user');
    setCurrentUser(null);
  };

  // Helpers
  const formatDuration = (minutes: number | null) => {
    if (!minutes) return 'أقل من دقيقة';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs > 0) {
      return `${hrs} ساعة و ${mins} دقيقة`;
    }
    return `${mins} دقيقة`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'running': return 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusArabic = (status: string) => {
    switch (status) {
      case 'pending': return 'بانتظار الانطلاق';
      case 'running': return 'جاري التنفيذ (مستمر)';
      case 'completed': return 'مكتملة ومستلمة';
      default: return status;
    }
  };

  const getVehicleStatusArabic = (status: string) => {
    switch (status) {
      case 'available': return 'جاهزة للعمل';
      case 'on_duty': return 'في مهمة حالية';
      case 'maintenance': return 'قيد الصيانة';
      default: return status;
    }
  };

  // Stats Counters
  const totalDutiesCount = dutiesList.length;
  const activeDutiesCount = dutiesList.filter(d => d.status === 'running').length;
  const pendingDutiesCount = dutiesList.filter(d => d.status === 'pending').length;
  const completedDutiesCount = dutiesList.filter(d => d.status === 'completed').length;
  
  // Total work hours calculated
  const totalWorkMinutes = dutiesList.reduce((acc, curr) => acc + (curr.durationMinutes || 0), 0);
  const totalWorkHours = (totalWorkMinutes / 60).toFixed(1);

  // Filters and Search Logic
  const filteredDuties = dutiesList.filter(d => {
    const driver = allUsers.find(u => u.id === d.driverId);
    const vehicle = vehiclesList.find(v => v.id === d.vehicleId);
    const textSearch = (d.dutyType || '').toLowerCase() + 
                       (driver?.name || '').toLowerCase() + 
                       (vehicle?.plateNumber || '').toLowerCase() + 
                       (vehicle?.model || '').toLowerCase();
    
    const matchesSearch = textSearch.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Render Authentication Portal if not logged in
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between" dir="rtl">
        {/* Navigation / Header */}
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-2.5 bg-amber-500 rounded-xl text-slate-900 shadow-lg shadow-amber-500/20">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                  مسار <span className="text-amber-400 font-normal text-sm px-2 py-0.5 bg-slate-800 rounded">نظام النقل الذكي</span>
                </h1>
                <p className="text-xs text-slate-400">إدارة حركة وتتبع المركبات والمهام</p>
              </div>
            </div>
            
            <button 
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium py-2 px-3.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isSeeding ? 'جاري ملء البيانات...' : 'تعبئة بيانات تجريبية سريعة'}
            </button>
          </div>
        </header>

        {/* Auth Body */}
        <main className="flex-grow flex items-center justify-center p-4 my-8">
          <div className="w-full max-w-md bg-slate-800/80 rounded-2xl border border-slate-700/60 p-8 shadow-2xl backdrop-blur relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>

            <div className="text-center mb-8 relative">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full">
                إدارة أسطول النقل والحركة
              </span>
              <h2 className="text-2xl font-bold mt-4 text-white">
                {authMode === 'login' ? 'سجل دخولك لبدء العمل' : 'إنشاء حساب جديد لسائق'}
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                {authMode === 'login' 
                  ? 'يرجى إدخال بيانات حسابك الممنوحة من مسؤول الحركة للبدء.'
                  : 'خاص بالسائقين الجدد للتسجيل في نظام التتبع والمهام.'
                }
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500/40 rounded-xl text-red-200 text-sm flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-emerald-900/30 border border-emerald-500/40 rounded-xl text-emerald-200 text-sm">
                {successMessage}
              </div>
            )}

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">اسم المستخدم (المشرف أو السائق)</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="مثال: admin أو driver1"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-905 font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 mt-4 text-slate-900"
                >
                  {isLoading ? 'جاري التحقق...' : 'دخول إلى لوحة التحكم'}
                </button>

                <div className="pt-4 border-t border-slate-700/50 text-center">
                  <p className="text-xs text-slate-400">
                    أنت سائق جديد وتريد إنشاء حساب شخصي؟{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setErrorMessage('');
                      }}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      سجل هنا
                    </button>
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">اسم المستخدم الفريد (بالإنجليزي)</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="مثال: khaled_99"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">اسمك الثلاثي الكامل (بالعربي)</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="مثال: خالد بن محمد العتيبي"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">رقم الهاتف</label>
                  <input
                    type="text"
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="05xxxxxxxx"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  />
                </div>

                <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 text-xs text-amber-300">
                  ⚠️ حسابك سيتم إنشاؤه كـ <strong>سائق مركبة</strong> لتلقي المهام من مسؤول الحركة مباشرة.
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-3 rounded-xl transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 mt-2"
                >
                  {isLoading ? 'جاري الإنشاء والتحقق...' : 'إنشاء حساب السائق الآن'}
                </button>

                <div className="pt-3 border-t border-slate-700/50 text-center">
                  <p className="text-xs text-slate-400">
                    لديك حساب بالفعل؟{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setErrorMessage('');
                      }}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      تسجيل الدخول
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Quick Helper Credentials */}
            <div className="mt-6 bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-2">
              <p className="font-bold text-amber-400 flex items-center gap-1">💡 حسابات تجريبية سريعة ومعدة مسبقاً:</p>
              <div className="grid grid-cols-1 gap-1 text-slate-400">
                <div>• المسؤول (المتحكم): <code className="text-white bg-slate-800 px-1 py-0.5 rounded">admin</code> وكلمة المرور <code className="text-white bg-slate-800 px-1 py-0.5 rounded">123</code></div>
                <div>• المسؤول الأعلى (متابع): <code className="text-white bg-slate-800 px-1 py-0.5 rounded">viewer</code> وكلمة المرور <code className="text-white bg-slate-800 px-1 py-0.5 rounded">123</code></div>
                <div>• سائق 1 (ياسر): <code className="text-white bg-slate-800 px-1 py-0.5 rounded">driver1</code> وكلمة المرور <code className="text-white bg-slate-800 px-1 py-0.5 rounded">123</code></div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-6 text-xs text-slate-500 border-t border-slate-800/80">
          مسار للنقل الذكي © ٢٠٢٦ - مخصص لجميع الهواتف الذكية بنظامي Android و iOS.
        </footer>
      </div>
    );
  }

  // Dashboard layout for logged-in users (Admin, Viewer, Driver)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row" dir="rtl">
      
      {/* SIDEBAR FOR DESKTOP / TOP NAVIGATION FOR MOBILE */}
      <aside className="w-full md:w-64 bg-slate-900 border-l border-slate-800 flex flex-col flex-shrink-0">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg text-slate-900">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white tracking-tight">مسار للحركة</h2>
              <span className="text-xs text-slate-400">نظام إدارة النقل</span>
            </div>
          </div>
        </div>

        {/* User Badge Info */}
        <div className="p-4 mx-4 my-4 bg-slate-800/50 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-xs text-white truncate">{currentUser.name}</h4>
              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                {currentUser.role === 'admin' && 'مسؤول تنظيم الحركة'}
                {currentUser.role === 'viewer' && 'مسؤول المتابعة الأعلى'}
                {currentUser.role === 'driver' && 'سائق المركبة'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <Gauge className="h-4 w-4" />
            <span>لوحة التحكم الرئيسة</span>
          </button>

          <button
            onClick={() => setActiveTab('duties')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'duties' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>{currentUser.role === 'driver' ? 'مهامي وواجباتي' : 'المهام وحركات النقل'}</span>
          </button>

          {/* Admin and Viewer Only Sections */}
          {currentUser.role !== 'driver' && (
            <>
              <button
                onClick={() => setActiveTab('vehicles')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'vehicles' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Truck className="h-4 w-4" />
                <span>أسطول المركبات</span>
              </button>

              <button
                onClick={() => setActiveTab('drivers')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'drivers' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>إدارة المستخدمين والسائقين</span>
              </button>
            </>
          )}

          {selectedGpsVehicleId && (
            <button
              onClick={() => setActiveTab('gps')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeTab === 'gps' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <MapPin className="h-4 w-4 text-rose-400" />
              <span>تتبع الـ GPS الحالي</span>
            </button>
          )}
        </nav>

        {/* Logout Bottom */}
        <div className="p-4 border-t border-slate-800 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between text-slate-400 hover:text-red-400 transition-colors bg-slate-850 px-4 py-3 rounded-xl text-xs"
          >
            <span className="font-semibold">تسجيل الخروج</span>
            <LogOut className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </aside>

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top bar for mobile and notification bar */}
        <header className="bg-slate-900 border-b border-slate-800 py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">
              {activeTab === 'dashboard' && 'نظرة عامة على الحركة'}
              {activeTab === 'duties' && 'مهام الحركة والتشغيل'}
              {activeTab === 'vehicles' && 'المركبات والآليات'}
              {activeTab === 'drivers' && 'فريق السائقين والمتابعين'}
              {activeTab === 'gps' && 'تتبع موقع المركبة الفعلي'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick alert notifications or status badge */}
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              مستقر ومتصل
            </span>
          </div>
        </header>

        {/* Alerts / Error Messages */}
        <div className="px-6 pt-4">
          {successMessage && (
            <div className="p-4 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-sm rounded-xl flex items-center gap-2 shadow-lg">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-950/80 border border-red-500/40 text-red-200 text-sm rounded-xl flex items-center gap-2 shadow-lg">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* DYNAMIC CONTENT SWITCHER */}
        <div className="p-6 space-y-6">

          {/* 1. DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Responsive Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-xs font-semibold text-slate-400 block">إجمالي المهام</span>
                  <span className="text-2xl font-bold mt-2 block text-white">{totalDutiesCount}</span>
                  <div className="absolute top-4 left-4 p-2 bg-slate-800 rounded-lg text-slate-400">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-xs font-semibold text-emerald-400 block">مهام جارية الآن</span>
                  <span className="text-2xl font-bold mt-2 block text-white">{activeDutiesCount}</span>
                  <div className="absolute top-4 left-4 p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                    <Play className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-xs font-semibold text-blue-400 block">المهام المكتملة</span>
                  <span className="text-2xl font-bold mt-2 block text-white">{completedDutiesCount}</span>
                  <div className="absolute top-4 left-4 p-2 bg-blue-500/10 rounded-lg text-blue-400">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl relative overflow-hidden">
                  <span className="text-xs font-semibold text-amber-400 block">ساعات العمل الإجمالية</span>
                  <span className="text-2xl font-bold mt-2 block text-white">{totalWorkHours} <span className="text-xs text-slate-400">ساعة</span></span>
                  <div className="absolute top-4 left-4 p-2 bg-amber-500/10 rounded-lg text-amber-400">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>

              </div>

              {/* Action Bar for Admin & Viewer */}
              {currentUser.role === 'admin' && (
                <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-base text-amber-300">مرحباً بك في وحدة التحكم والتوزيع</h3>
                    <p className="text-xs text-slate-400 mt-1">يمكنك إسناد واجبات جديدة فورية، وتفعيل أو إلغاء تتبع الـ GPS في أي مركبة.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        if (vehiclesList.length === 0) {
                          alert("الرجاء إضافة مركبة أولاً لتتمكن من إسناد مهمة");
                          return;
                        }
                        setShowDutyModal(true);
                      }}
                      className="bg-amber-500 hover:bg-amber-650 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4" />
                      إسناد واجب جديد لسائق
                    </button>
                    <button
                      onClick={() => setShowVehicleModal(true)}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-2.5 rounded-xl text-xs border border-slate-700 flex items-center gap-1.5"
                    >
                      <Plus className="h-4 w-4 text-slate-400" />
                      إضافة مركبة للأسطول
                    </button>
                  </div>
                </div>
              )}

              {/* Active Duty Quick Notice for Drivers */}
              {currentUser.role === 'driver' && (
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="font-bold text-sm text-slate-300">إرشادات للسائقين:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-amber-400 block mb-1">١. استلام الواجب</span>
                      ستظهر المهام المسندة إليك أدناه. يرجى مراجعة تفاصيل نوع الواجب والسيارة المحددة لك.
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-emerald-400 block mb-1">٢. زر انطلاق المهمة</span>
                      عند ركوب السيارة والتحرك، اضغط على "ابدأ الحركة" لبدء تسجيل الساعات وإرسال التحديثات.
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-blue-400 block mb-1">٣. إنجاز المهمة والرجوع</span>
                      عند العودة إلى الكراج، اضغط "انتهت المهمة" لحفظ عدد الساعات بدقة وإغلاق الطلب.
                    </div>
                  </div>
                </div>
              )}

              {/* Main Lists summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Duties Track Column */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-amber-500" />
                      {currentUser.role === 'driver' ? 'قائمة مهامك الحالية والأخيرة' : 'آخر التحركات والواجبات المجدولة'}
                    </h3>
                    <button 
                      onClick={() => setActiveTab('duties')}
                      className="text-xs text-amber-400 font-medium hover:underline flex items-center gap-1"
                    >
                      عرض الكل
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Duties cards list */}
                  <div className="space-y-3">
                    {filteredDuties.slice(0, 4).map((duty) => {
                      const driver = allUsers.find(u => u.id === duty.driverId);
                      const vehicle = vehiclesList.find(v => v.id === duty.vehicleId);
                      return (
                        <div key={duty.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getStatusColor(duty.status)}`}>
                              {getStatusArabic(duty.status)}
                            </span>
                            <span className="text-xs text-slate-500">
                              تم الإنشاء: {new Date(duty.createdAt).toLocaleDateString('ar-EG')}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">نوع الواجب والتعليمات</span>
                            <h4 className="text-sm font-bold text-white mt-1 leading-relaxed">{duty.dutyType}</h4>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs">
                            <div>
                              <span className="text-slate-400 block text-[10px]">المركبة المخصصة</span>
                              <span className="font-bold text-amber-400 block mt-0.5">{vehicle?.model || 'غير محددة'}</span>
                              <span className="text-slate-500 text-[10px] block mt-0.5">لوحة: {vehicle?.plateNumber}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">السائق المكلف</span>
                              <span className="font-bold text-white block mt-0.5">{driver?.name || 'غير محدد'}</span>
                              {driver?.phone && <span className="text-slate-500 text-[10px] block mt-0.5">هاتف: {driver.phone}</span>}
                            </div>
                          </div>

                          {/* Interactive Driver Action Buttons */}
                          {currentUser.role === 'driver' && duty.driverId === currentUser.id && (
                            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex flex-wrap gap-2 items-center justify-between">
                              <span className="text-[10px] text-slate-400">تحكم السائق الفوري:</span>
                              <div className="flex gap-2">
                                {duty.status === 'pending' && (
                                  <button
                                    onClick={() => handleStartDuty(duty.id)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                                  >
                                    <Play className="h-3 w-3" />
                                    ابدأ الحركة الآن
                                  </button>
                                )}
                                {duty.status === 'running' && (
                                  <>
                                    <button
                                      onClick={() => handleSendGpsUpdate(duty.id, duty.vehicleId)}
                                      className="bg-slate-800 hover:bg-slate-750 text-white font-semibold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                                    >
                                      <MapPin className="h-3 w-3 text-rose-500" />
                                      محاكاة إرسال GPS الحالي
                                    </button>
                                    <button
                                      onClick={() => setShowCompleteDutyModal(duty.id)}
                                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      انتهت المهمة ورجعت للكراج
                                    </button>
                                  </>
                                )}
                                {duty.status === 'completed' && (
                                  <span className="text-xs text-slate-400 flex items-center gap-1 font-semibold text-emerald-400">
                                    <CheckCircle className="h-4 w-4" />
                                    تم إنجازها بنجاح (المستغرق: {formatDuration(duty.durationMinutes)})
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Time details and admin review */}
                          {duty.status === 'completed' && (
                            <div className="bg-slate-950/40 p-3 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between text-slate-400">
                                <span>إجمالي وقت المهمة:</span>
                                <span className="font-bold text-white">{formatDuration(duty.durationMinutes)}</span>
                              </div>
                              {duty.driverRating && (
                                <div className="flex justify-between text-slate-400">
                                  <span>تقييم الأداء:</span>
                                  <span className="flex items-center gap-0.5 text-amber-400">
                                    {Array.from({ length: duty.driverRating }).map((_, i) => (
                                      <Star key={i} className="h-3 w-3 fill-current" />
                                    ))}
                                  </span>
                                </div>
                              )}
                              {duty.feedback && (
                                <p className="text-slate-400 italic text-[11px] pt-1.5 border-t border-slate-800">
                                  "{duty.feedback}"
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {filteredDuties.length === 0 && (
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center text-slate-500">
                        <ClipboardList className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs">لا يوجد واجبات أو مهام نقل مسجلة حالياً</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vehicles Status Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <Truck className="h-4 w-4 text-amber-500" />
                      حالة أسطول المركبات
                    </h3>
                    {currentUser.role !== 'driver' && (
                      <button 
                        onClick={() => setActiveTab('vehicles')}
                        className="text-xs text-amber-400 font-medium hover:underline"
                      >
                        إدارة السيارات
                      </button>
                    )}
                  </div>

                  {/* Vehicle list */}
                  <div className="space-y-3">
                    {vehiclesList.slice(0, 4).map((vehicle) => (
                      <div key={vehicle.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{vehicle.model}</span>
                          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                            {vehicle.plateNumber}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[10px]">الـ GPS والتعقب:</span>
                          <span className="flex items-center gap-1 font-medium">
                            {vehicle.gpsEnabled ? (
                              <span className="text-emerald-400 flex items-center gap-1 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                {vehicle.gpsType === 'phone' ? <Phone className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
                                نشط ({vehicle.gpsType === 'phone' ? 'الهاتف' : 'جهاز لاسلكي'})
                              </span>
                            ) : (
                              <span className="text-slate-500">معطل / غير مفعل</span>
                            )}
                          </span>
                        </div>

                        {/* GPS Toggle for Admin */}
                        {currentUser.role === 'admin' && (
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500">مفتاح التحكم بالتعقب:</span>
                            <button
                              onClick={() => toggleVehicleGps(vehicle.id, vehicle.gpsEnabled, vehicle.gpsType)}
                              className={`text-[10px] px-2.5 py-1 rounded font-bold transition-all ${
                                vehicle.gpsEnabled 
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              }`}
                            >
                              {vehicle.gpsEnabled ? 'إيقاف الـ GPS' : 'تفعيل الـ GPS'}
                            </button>
                          </div>
                        )}

                        {vehicle.gpsEnabled && vehicle.lastLatitude && (
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-[10px] text-rose-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              إحداثي: {vehicle.lastLatitude.toFixed(3)}, {vehicle.lastLongitude.toFixed(3)}
                            </span>
                            <button
                              onClick={() => handleViewGpsLogs(vehicle.id)}
                              className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                            >
                              خريطة التتبع
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {vehiclesList.length === 0 && (
                      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl text-center text-slate-500 text-xs">
                        لا يوجد مركبات مسجلة في الحركة بعد
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. DUTIES TAB (FULL CRUD FLOWS) */}
          {activeTab === 'duties' && (
            <div className="space-y-6">
              
              {/* Filter and search row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800/80">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 right-3 flex items-center text-slate-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-10 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    placeholder="ابحث برقم لوحة، اسم السائق، أو نوع الواجب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 flex-shrink-0">حالة الواجب:</span>
                  <select
                    className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">كل الحالات</option>
                    <option value="pending">بانتظار الانطلاق</option>
                    <option value="running">جاري التنفيذ</option>
                    <option value="completed">مكتملة</option>
                  </select>
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      if (vehiclesList.length === 0) {
                        alert("يرجى إضافة سيارة أولاً");
                        return;
                      }
                      setShowDutyModal(true);
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    إسناد واجب جديد
                  </button>
                )}
              </div>

              {/* Duties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDuties.map((duty) => {
                  const driver = allUsers.find(u => u.id === duty.driverId);
                  const vehicle = vehiclesList.find(v => v.id === duty.vehicleId);
                  
                  return (
                    <div key={duty.id} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl relative space-y-4">
                      
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${getStatusColor(duty.status)}`}>
                          {getStatusArabic(duty.status)}
                        </span>
                        
                        {/* Admin delete option */}
                        {currentUser.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteDuty(duty.id)}
                            className="text-xs text-red-400 hover:text-red-500"
                          >
                            حذف المهمة
                          </button>
                        )}
                      </div>

                      <div>
                        <span className="text-[10px] text-amber-400 block font-bold uppercase tracking-widest">تفاصيل الواجب ونوع المهمة</span>
                        <h4 className="text-sm font-bold text-white mt-1 leading-relaxed">{duty.dutyType}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 text-xs">
                        <div className="bg-slate-950/40 p-2.5 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">المركبة ومواصفاتها</span>
                          <span className="font-bold text-white block mt-0.5">{vehicle?.model || 'غير محددة'}</span>
                          <span className="text-amber-400 text-[10px] block font-mono mt-0.5">{vehicle?.plateNumber}</span>
                          <span className="text-[9px] text-slate-500 mt-1 block">
                            نظام GPS: {vehicle?.gpsEnabled ? 'نشط ومتصل' : 'معطل'}
                          </span>
                        </div>

                        <div className="bg-slate-950/40 p-2.5 rounded-xl">
                          <span className="text-slate-400 block text-[10px]">السائق المسؤول</span>
                          <span className="font-bold text-white block mt-0.5">{driver?.name || 'غير معروف'}</span>
                          {driver?.phone && <span className="text-slate-500 text-[10px] block mt-0.5">📞 {driver.phone}</span>}
                        </div>
                      </div>

                      {/* Work Hours and Completion details */}
                      {duty.status === 'completed' && (
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                          <div className="flex justify-between items-center text-slate-300">
                            <span>مدة التوصيل والعمل:</span>
                            <span className="font-bold text-amber-400">{formatDuration(duty.durationMinutes)}</span>
                          </div>
                          {duty.driverRating && (
                            <div className="flex justify-between items-center text-slate-300">
                              <span>تقييم مسؤول الحركة للسائق والمركبة:</span>
                              <span className="flex items-center gap-0.5 text-amber-400">
                                {Array.from({ length: duty.driverRating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-current" />
                                ))}
                              </span>
                            </div>
                          )}
                          {duty.feedback && (
                            <p className="text-slate-400 italic text-[11px] pt-1.5 border-t border-slate-800">
                              "{duty.feedback}"
                            </p>
                          )}
                        </div>
                      )}

                      {/* Driver actions inside duty list */}
                      {currentUser.role === 'driver' && duty.driverId === currentUser.id && (
                        <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 flex flex-wrap gap-2 items-center justify-between">
                          <span className="text-[10px] text-amber-300 font-semibold">تحكم بمهتك الحالية:</span>
                          <div className="flex gap-2">
                            {duty.status === 'pending' && (
                              <button
                                onClick={() => handleStartDuty(duty.id)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                              >
                                ابدأ الحركة (مغادرة الكراج)
                              </button>
                            )}
                            {duty.status === 'running' && (
                              <>
                                <button
                                  onClick={() => handleSendGpsUpdate(duty.id, duty.vehicleId)}
                                  className="bg-slate-800 text-white font-semibold px-2.5 py-1.5 rounded-lg text-xs border border-slate-750"
                                >
                                  إرسال تحديث GPS
                                </button>
                                <button
                                  onClick={() => setShowCompleteDutyModal(duty.id)}
                                  className="bg-blue-500 hover:bg-blue-650 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                                >
                                  تم إنجاز المهمة والرجوع
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}

                {filteredDuties.length === 0 && (
                  <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500">
                    <ClipboardList className="h-12 w-12 mx-auto mb-3 text-slate-600" />
                    <p className="text-sm font-semibold text-slate-400">لم يتم العثور على أي واجبات نقل تطابق الفلترة الحالية</p>
                    <p className="text-xs text-slate-500 mt-1">الرجاء إدخال تفاصيل حركة جديدة أو التحقق من الكلمات البحثية.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 3. VEHICLES TAB (CRUD & ACTIVATE/DEACTIVATE GPS) */}
          {activeTab === 'vehicles' && currentUser.role !== 'driver' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  قائمة بجميع المركبات المسجلة، يمكنك مراقبة الحالة العامة ونظام التعقب.
                </p>
                <button
                  onClick={() => setShowVehicleModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  إضافة مركبة للأسطول
                </button>
              </div>

              {/* Vehicles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vehiclesList.map((vehicle) => (
                  <div key={vehicle.id} className="bg-slate-900 border border-slate-800/80 p-5 rounded-2xl space-y-4">
                    
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-white">{vehicle.model}</h4>
                        <span className="text-xs text-slate-400">المعرف: #{vehicle.id}</span>
                      </div>
                      <span className="text-xs font-mono bg-slate-950 text-amber-400 px-3 py-1 rounded border border-slate-800">
                        {vehicle.plateNumber}
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">الحالة التشغيلية:</span>
                        <span className="font-bold text-white bg-slate-950 px-2 py-0.5 rounded">
                          {getVehicleStatusArabic(vehicle.status)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">تقييم السيارة الإجمالي:</span>
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                          {vehicle.rating} <Star className="h-3.5 w-3.5 fill-current" />
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">نظام تحديد المواقع (GPS):</span>
                        <span className="font-bold text-white">
                          {vehicle.gpsEnabled ? 'مفعّل ونشط' : 'معطل ومغلق'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">نوع الـ GPS المعتمد:</span>
                        <span className="text-amber-300">
                          {vehicle.gpsType === 'phone' ? 'جي بي اس الهاتف الذكي' : 'جي بي اس خارجي لاسلكي بالمركبة'}
                        </span>
                      </div>

                      {vehicle.notes && (
                        <p className="text-[11px] text-slate-500 bg-slate-950/40 p-2 rounded-lg">
                          💡 {vehicle.notes}
                        </p>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                      <span className="text-[10px] text-slate-400 block font-semibold">لوحة تحكم المسؤول ووحدة الحركة:</span>
                      
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleVehicleGps(vehicle.id, vehicle.gpsEnabled, vehicle.gpsType)}
                          className={`flex-1 text-[11px] py-1.5 rounded font-bold transition-all text-center ${
                            vehicle.gpsEnabled 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {vehicle.gpsEnabled ? 'إلغاء تفعيل الـ GPS' : 'تفعيل الـ GPS'}
                        </button>

                        <button
                          onClick={() => {
                            const newType = vehicle.gpsType === 'phone' ? 'external_wireless' : 'phone';
                            toggleVehicleGps(vehicle.id, !vehicle.gpsEnabled, newType);
                          }}
                          className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1.5 rounded"
                          title="تغيير نوع الجي بي اس"
                        >
                          تغيير المصدر
                        </button>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                        {vehicle.gpsEnabled && vehicle.lastLatitude && (
                          <button
                            onClick={() => handleViewGpsLogs(vehicle.id)}
                            className="flex-1 text-xs bg-amber-500 text-slate-950 font-bold py-1.5 rounded text-center flex items-center justify-center gap-1"
                          >
                            <MapPin className="h-3 w-3" />
                            تتبع الموقع والمسار
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="text-xs text-red-400 hover:bg-red-550/10 hover:text-red-300 px-2.5 py-1.5 rounded"
                        >
                          حذف
                        </button>
                      </div>
                    </div>

                  </div>
                ))}

                {vehiclesList.length === 0 && (
                  <div className="col-span-3 bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500">
                    <Truck className="h-12 w-12 mx-auto mb-2 text-slate-600" />
                    <p className="text-sm">لا توجد سيارات بالأسطول حالياً</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* 4. DRIVERS / USERS TAB */}
          {activeTab === 'drivers' && currentUser.role !== 'driver' && (
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  الأشخاص المسجلين بالنظام (سائقين، مسؤولين عن الحركة، أو للمتابعة من قبل المسؤول الأعلى).
                </p>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setShowUserModal(true)}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    إضافة يوزر للمتابعة أو سائق
                  </button>
                )}
              </div>

              {/* Users Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allUsers.map((u) => (
                  <div key={u.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center font-bold text-lg border border-amber-500/10">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{u.name}</h4>
                        <span className="text-xs text-slate-500">اسم المستخدم: {u.username}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">الصلاحية بالنظام:</span>
                        <span className="font-bold text-amber-400">
                          {u.role === 'admin' && 'مسؤول تنظيم الحركة'}
                          {u.role === 'viewer' && 'مسؤول أعلى للمتابعة'}
                          {u.role === 'driver' && 'سائق مخصص'}
                        </span>
                      </div>

                      {u.phone && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">رقم الجوال:</span>
                          <span className="text-white font-mono">{u.phone}</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-slate-400">تاريخ التسجيل:</span>
                        <span className="text-slate-500">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>

                    {/* Drivers Specific Info (Total work summary) */}
                    {u.role === 'driver' && (
                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400">
                        <span className="font-bold text-white block mb-1">إحصائيات العمل والالتزام:</span>
                        <div className="flex justify-between mt-1">
                          <span>المهام المنجزة:</span>
                          <span className="font-bold text-amber-400">
                            {dutiesList.filter(d => d.driverId === u.id && d.status === 'completed').length} مهمة
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span>ساعات العمل الإجمالية:</span>
                          <span className="font-bold text-white">
                            {((dutiesList.filter(d => d.driverId === u.id).reduce((sum, d) => sum + (d.durationMinutes || 0), 0)) / 60).toFixed(1)} ساعة
                          </span>
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>

            </div>
          )}

          {/* 5. GPS GRAPHICAL/LOGS TAB */}
          {activeTab === 'gps' && selectedGpsVehicleId && (
            <div className="space-y-6">
              
              {/* Back to list or dashboard helper */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">
                    تتبع خط سير المركبة: {vehiclesList.find(v => v.id === selectedGpsVehicleId)?.model}
                  </h3>
                  <p className="text-xs text-slate-400">
                    لوحة رقم: <span className="font-mono text-amber-400 font-bold">{vehiclesList.find(v => v.id === selectedGpsVehicleId)?.plateNumber}</span>
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  العودة للرئيسة
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              {/* Simulated Graphical Map Route container */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
                  📍 خريطة خط السير التفاعلية (المحاكاة)
                </span>

                <div className="relative h-72 bg-slate-950 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
                  
                  {/* Grid Lines Pattern simulation */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                  
                  {/* Outer boundaries / Road simulation lines */}
                  <div className="absolute h-0.5 w-full bg-slate-800/60 top-1/3"></div>
                  <div className="absolute h-0.5 w-full bg-slate-800/60 top-2/3"></div>
                  <div className="absolute w-0.5 h-full bg-slate-800/60 left-1/3"></div>
                  <div className="absolute w-0.5 h-full bg-slate-800/60 left-2/3"></div>

                  {/* Marker Dot for Vehicle Current Position */}
                  <div className="absolute p-2 bg-rose-500 text-white rounded-full animate-bounce z-10">
                    <MapPin className="h-5 w-5" />
                  </div>

                  {/* Past GPS log points dotted route */}
                  {selectedVehicleGpsLogs.map((log, index) => {
                    const offsetLeft = 30 + (index * 12) % 60;
                    const offsetTop = 40 + (index * 8) % 50;
                    return (
                      <div 
                        key={log.id} 
                        className="absolute h-2 w-2 rounded-full bg-amber-400/80"
                        style={{ left: `${offsetLeft}%`, top: `${offsetTop}%` }}
                        title={`سجل GPS الإحداثي: ${log.latitude}`}
                      ></div>
                    );
                  })}

                  {/* Simulated City landmarks / Riyadh */}
                  <div className="absolute top-8 right-12 text-[10px] text-slate-500 font-bold">بوابة الكراج الرئيسي</div>
                  <div className="absolute bottom-12 left-16 text-[10px] text-slate-500 font-bold">موقع توصيل الشحنة</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center bg-slate-900/90 px-4 py-2 rounded-lg border border-slate-800 z-10">
                    <p className="text-xs font-bold text-white">إحداثيات الموقع الحالي المباشر</p>
                    <p className="text-[10px] text-rose-400 mt-1 font-mono">
                      {vehiclesList.find(v => v.id === selectedGpsVehicleId)?.lastLatitude?.toFixed(5) || '24.7136'} شمالاً ، 
                      {vehiclesList.find(v => v.id === selectedGpsVehicleId)?.lastLongitude?.toFixed(5) || '46.6753'} شرقاً
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-1">تحديث قبل لحظات</span>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>حالة نظام الـ GPS للمركبة:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      نشط ومتصل حالياً
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>مصدر التتبع الحالي:</span>
                    <span className="text-amber-400 font-bold">
                      {vehiclesList.find(v => v.id === selectedGpsVehicleId)?.gpsType === 'phone' 
                        ? 'جي بي اس هاتف السائق الذكي (Android/iOS)' 
                        : 'جي بي اس خارجي لاسلكي مدمج بالسيارة'
                      }
                    </span>
                  </div>
                </div>

                {/* History list of logged points */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-white">سجل المواقع الأخير (30 إحداثي):</span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
                    {selectedVehicleGpsLogs.map((log) => (
                      <div key={log.id} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-amber-500" />
                          خط عرض: {log.latitude.toFixed(5)} ، خط طول: {log.longitude.toFixed(5)}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.recordedAt).toLocaleTimeString('ar-EG')}
                        </span>
                      </div>
                    ))}

                    {selectedVehicleGpsLogs.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">لم يتم تسجيل نقاط مسار سابقة لهذه المركبة بعد</p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* ========================================================
          ALL POPUPS / DIALOG MODALS 
         ======================================================== */}

      {/* 1. ASSIGN DUTY MODAL */}
      {showDutyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">إسناد واجب جديد لسائق معين بسيارة معينة</h3>
              <button onClick={() => setShowDutyModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDuty} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">اختر السائق المكلف بالواجب</label>
                <select
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  value={dutyForm.driverId}
                  onChange={(e) => setDutyForm({ ...dutyForm, driverId: e.target.value })}
                >
                  <option value="">-- اختر السائق --</option>
                  {allUsers.filter(u => u.role === 'driver').map(driver => (
                    <option key={driver.id} value={driver.id}>{driver.name} ({driver.username})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">اختر المركبة المتاحة للواجب</label>
                <select
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  value={dutyForm.vehicleId}
                  onChange={(e) => setDutyForm({ ...dutyForm, vehicleId: e.target.value })}
                >
                  <option value="">-- اختر السيارة --</option>
                  {vehiclesList.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.model} ({v.plateNumber}) - [{getVehicleStatusArabic(v.status)}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">نوع الواجب وتفاصيل المهمة بالكامل</label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="مثال: توصيل دفعة من قطع الغيار للمستودع الشرقي ومراجعة مستندات الاستلام."
                  value={dutyForm.dutyType}
                  onChange={(e) => setDutyForm({ ...dutyForm, dutyType: e.target.value })}
                />
              </div>

              <div className="bg-amber-500/5 p-3 rounded-lg border border-amber-500/10 text-[11px] text-amber-300 leading-relaxed">
                💡 بمجرد الحفظ، ستصل المهمة في حساب السائق فوراً كإشعار تذكيري للبدء والانطلاق.
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDutyModal(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-semibold px-4 py-2.5 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl"
                >
                  إسناد المهمة وإرسالها
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. ADD VEHICLE MODAL */}
      {showVehicleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">إضافة مركبة جديدة للأسطول</h3>
              <button onClick={() => setShowVehicleModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">رقم لوحة السيارة</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="أ ب ج ١٢٣٤"
                    value={vehicleForm.plateNumber}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, plateNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">نوع وموديل المركبة</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="مثال: تويوتا كامري ٢٠٢٤"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">نوع نظام الـ GPS الافتراضي</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    value={vehicleForm.gpsType}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, gpsType: e.target.value })}
                  >
                    <option value="phone">GPS الهاتف الذكي للسائق</option>
                    <option value="external_wireless">GPS خارجي لاسلكي بالسيارة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">حالة تفعيل الـ GPS البدئية</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    value={vehicleForm.gpsEnabled ? 'true' : 'false'}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, gpsEnabled: e.target.value === 'true' })}
                  >
                    <option value="true">مفعّل للتعقب والمراقبة</option>
                    <option value="false">معطل حالياً</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">ملاحظات عن السيارة</label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="صيانة دورية متبقية، قطع غيار خاصة الخ"
                  value={vehicleForm.notes}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-semibold px-4 py-2.5 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl"
                >
                  إضافة المركبة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. ADD USER/VIEWER MODAL */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">إضافة يوزر متابعة أو سائق جديد</h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1.5">اسم الشخص الكامل بالعربي</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="مثال: العقيد فهد السديري"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">اسم المستخدم (بالأحرف الإنجليزية)</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="مثال: fahad_user"
                    value={userForm.username}
                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">كلمة المرور البدئية</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="••••••••"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">نوع وصلاحية الحساب</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="viewer">مسؤول أعلى للمتابعة (مشاهدة وتقارير فقط)</option>
                    <option value="driver">سائق مركبة (تلقي الأوامر والتتبع)</option>
                    <option value="admin">مسؤول حركة كامل الصلاحيات</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">رقم الهاتف الجوال</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    placeholder="05xxxxxxxx"
                    value={userForm.phone}
                    onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-slate-400 text-[11px] leading-relaxed">
                ℹ️ حسابات <strong>المسؤول الأعلى (viewer)</strong> يمكنها متابعة كافة حركات النقل وتقارير الجي بي اس والسيارات بالكامل دون القدرة على حذف أو تعديل البيانات الحساسة لضمان الخصوصية وسرية السير.
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-semibold px-4 py-2.5 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl"
                >
                  إنشاء الحساب الجديد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. DRIVER END DUTY / RETURN TO GARAGE WITH RATINGS */}
      {showCompleteDutyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">إنهاء مهمة النقل والعودة للكراج</h3>
              <button onClick={() => setShowCompleteDutyModal(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteDuty} className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                أهلاً بك مجدداً في الكراج بسلامة الله! يرجى تقديم تقييم سريع لتجربة قيادة المركبة وملاحظاتك لإنهاء المهمة وحساب ساعات العمل الإجمالية بدقة.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">تقييمك لجهوزية السيارة للمهمة</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    value={completeForm.vehicleRating}
                    onChange={(e) => setCompleteForm({ ...completeForm, vehicleRating: e.target.value })}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ ممتازة جداً</option>
                    <option value="4">⭐⭐⭐⭐ جيدة جداً</option>
                    <option value="3">⭐⭐⭐ متوسطة</option>
                    <option value="2">⭐⭐ تحتاج صيانة خفيفة</option>
                    <option value="1">⭐ غير ملائمة وبحاجة لإصلاح</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">تقييمك الذاتي لالتزام خط السير والوقت</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                    value={completeForm.driverRating}
                    onChange={(e) => setCompleteForm({ ...completeForm, driverRating: e.target.value })}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ التزام تام بالمسار والوقت</option>
                    <option value="4">⭐⭐⭐⭐ تأخير طفيف مع الالتزام بالتعليمات</option>
                    <option value="3">⭐⭐⭐ متوسط بسب الزحام المروري</option>
                    <option value="2">⭐⭐ واجهتني صعوبات بالغة</option>
                    <option value="1">⭐ لم يتم إنجاز الهدف المطلوب بدقة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">ملاحظات وتقرير التوصيل والتشغيل</label>
                <textarea
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-amber-500"
                  placeholder="اكتب أي تحديات واجهتك، حالة الطريق، أو ملاحظات هامة على المركبة لمسؤول الحركة..."
                  value={completeForm.feedback}
                  onChange={(e) => setCompleteForm({ ...completeForm, feedback: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCompleteDutyModal(null)}
                  className="bg-slate-800 hover:bg-slate-750 text-white font-semibold px-4 py-2.5 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl"
                >
                  تأكيد إنهاء المهمة وحفظ الساعات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
