import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import Home from './pages/Home';
import FishGuide from './pages/FishGuide';
import Spots from './pages/Spots';
import TechniqueGuide from './pages/TechniqueGuide';
import Plan from './pages/Plan';
import MySpots from './pages/MySpots';
import FishingMap from './pages/FishingMap';
import './index.css';

const Layout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Header />
    <main style={{ flex: 1, paddingBottom: '80px' }}>
      {children}
    </main>
    <BottomNav />
  </div>
);

const App = () => (
  <BrowserRouter>
    <AppProvider>
      <Routes>
        <Route path="/map" element={<FishingMap />} />
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/"        element={<Home />} />
              <Route path="/fish/*"  element={<FishGuide />} />
              <Route path="/spots/*" element={<Spots />} />
              <Route path="/guide/*" element={<TechniqueGuide />} />
              <Route path="/plan/*"  element={<Plan />} />
              <Route path="/myspots/*" element={<MySpots />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </AppProvider>
  </BrowserRouter>
);

export default App;
