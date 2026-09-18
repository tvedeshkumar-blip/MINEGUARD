import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import SafetyDashboard from './components/SafetyDashboard';
import Emergency from './components/Emergency';
import Statistics from './components/Statistics';
import Footer from './components/Footer';
import './App.css';

import { useRouter } from './router/useRouter';
import { AuthProvider } from './contexts/AuthContext';
import { LiveDataProvider } from './contexts/LiveDataContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const LandingPage = () => (
  <div className="app">
    <Navbar />
    <main>
      <Hero />
      <Features />
      <SafetyDashboard />
      <Emergency />
      <Statistics />
    </main>
    <Footer />
  </div>
);

const Router = () => {
  const { route } = useRouter();

  switch (route) {
    case '/login':
      return <LoginPage />;
    case '/dashboard':
      return <DashboardPage />;
    default:
      return <LandingPage />;
  }
};

function App() {
  return (
    <AuthProvider>
      <LiveDataProvider>
        <Router />
      </LiveDataProvider>
    </AuthProvider>
  );
}

export default App;
