import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import { Spinner } from '@/components/ui';


const Home = lazy(() => import('./pages/Home'));
const RemoveBg = lazy(() => import('./pages/RemoveBg'));
const Resize = lazy(() => import('./pages/Resize'));
const Crop = lazy(() => import('./pages/Crop'));
const Enhance = lazy(() => import('./pages/Enhance'));
const NotFound = lazy(() => import('./pages/NotFound'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
    <Spinner />
  </div>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="remove-bg" element={<RemoveBg />} />
            <Route path="resize" element={<Resize />} />
            <Route path="crop" element={<Crop />} />
            <Route path="enhance" element={<Enhance />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
