import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ParticlesBackground from '@/components/ParticlesBackground';
import { ThemeProvider } from '@/contexts/ThemeContext';

const MainLayout = () => {
    return (
        <ThemeProvider>
            <div className="main-layout">
                <ParticlesBackground />
                <Header />
                <main className="main-content">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </ThemeProvider>
    );
};

export default MainLayout;
