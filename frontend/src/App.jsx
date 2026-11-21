import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import DoctorDirectory from './pages/public/DoctorDirectory';
import DoctorDetails from './pages/public/DoctorDetails';
import Login from './pages/public/Login';
import Register from './pages/public/Register';
import Contact from './pages/public/Contact';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import FindDoctors from './pages/patient/FindDoctors';
import BookAppointment from './pages/patient/BookAppointment';
import MyAppointments from './pages/patient/MyAppointments';
import AppointmentDetails from './pages/patient/AppointmentDetails';
import MedicalRecords from './pages/patient/MedicalRecords';
import PrescriptionHistory from './pages/patient/PrescriptionHistory';
import AIHealthAssistant from './pages/patient/AIHealthAssistant';
import Notifications from './pages/patient/Notifications';
import AccountSettings from './pages/patient/AccountSettings';

// Medication & Pharmacy Pages
import MedicineInfo from './pages/patient/MedicineInfo';
import MyMedications from './pages/patient/MyMedications';
import MedicationSchedule from './pages/patient/MedicationSchedule';
import MedicationReminders from './pages/patient/MedicationReminders';
import MedicationSafetyAlerts from './pages/patient/MedicationSafetyAlerts';
import PharmacyInventory from './pages/pharmacy/PharmacyInventory';
import PharmacyAlerts from './pages/pharmacy/PharmacyAlerts';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorProfile from './pages/doctor/DoctorProfile';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorAppointmentDetails from './pages/doctor/DoctorAppointmentDetails';
import PatientRecords from './pages/doctor/PatientRecords';
import CreateMedicalRecord from './pages/doctor/CreateMedicalRecord';
import CreatePrescription from './pages/doctor/CreatePrescription';
import AvailabilityManagement from './pages/doctor/AvailabilityManagement';
import DoctorNotifications from './pages/doctor/DoctorNotifications';
import DoctorAccountSettings from './pages/doctor/DoctorAccountSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PatientManagement from './pages/admin/PatientManagement';
import DoctorManagement from './pages/admin/DoctorManagement';
import DoctorVerification from './pages/admin/DoctorVerification';
import AdminAppointmentManagement from './pages/admin/AdminAppointmentManagement';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import AuditLogs from './pages/admin/AuditLogs';
import SystemSettings from './pages/admin/SystemSettings';

// Public layout wrapper with Navbar & Footer
const PublicLayout = () => (
  <div className="flex flex-col min-h-screen bg-surface">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/doctors" element={<DoctorDirectory />} />
              <Route path="/doctors/:id" element={<DoctorDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Patient Routes */}
            <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/patient/dashboard" element={<PatientDashboard />} />
                <Route path="/patient/profile" element={<PatientProfile />} />
                <Route path="/patient/find-doctors" element={<FindDoctors />} />
                <Route path="/patient/book-appointment" element={<BookAppointment />} />
                <Route path="/patient/appointments" element={<MyAppointments />} />
                <Route path="/patient/appointments/:id" element={<AppointmentDetails />} />
                <Route path="/patient/records" element={<MedicalRecords />} />
                <Route path="/patient/prescriptions" element={<PrescriptionHistory />} />
                <Route path="/patient/my-medications" element={<MyMedications />} />
                <Route path="/patient/medication-schedule" element={<MedicationSchedule />} />
                <Route path="/patient/medication-reminders" element={<MedicationReminders />} />
                <Route path="/patient/medication-safety" element={<MedicationSafetyAlerts />} />
                <Route path="/medications/info" element={<MedicineInfo />} />
                <Route path="/patient/ai-assistant" element={<AIHealthAssistant />} />
                <Route path="/patient/notifications" element={<Notifications />} />
                <Route path="/patient/settings" element={<AccountSettings />} />
              </Route>
            </Route>

            {/* Doctor Routes */}
            <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                <Route path="/doctor/profile" element={<DoctorProfile />} />
                <Route path="/doctor/appointments" element={<DoctorAppointments />} />
                <Route path="/doctor/appointments/:id" element={<DoctorAppointmentDetails />} />
                <Route path="/doctor/patients" element={<PatientRecords />} />
                <Route path="/doctor/create-record" element={<CreateMedicalRecord />} />
                <Route path="/doctor/create-prescription" element={<CreatePrescription />} />
                <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
                <Route path="/pharmacy/alerts" element={<PharmacyAlerts />} />
                <Route path="/medications/info" element={<MedicineInfo />} />
                <Route path="/doctor/availability" element={<AvailabilityManagement />} />
                <Route path="/doctor/notifications" element={<DoctorNotifications />} />
                <Route path="/doctor/settings" element={<DoctorAccountSettings />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/patients" element={<PatientManagement />} />
                <Route path="/admin/doctors" element={<DoctorManagement />} />
                <Route path="/admin/verification" element={<DoctorVerification />} />
                <Route path="/admin/appointments" element={<AdminAppointmentManagement />} />
                <Route path="/pharmacy/inventory" element={<PharmacyInventory />} />
                <Route path="/pharmacy/alerts" element={<PharmacyAlerts />} />
                <Route path="/medications/info" element={<MedicineInfo />} />
                <Route path="/admin/departments" element={<DepartmentManagement />} />
                <Route path="/admin/audit-logs" element={<AuditLogs />} />
                <Route path="/admin/settings" element={<SystemSettings />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
