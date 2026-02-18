import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bars3Icon, XMarkIcon, HomeIcon, PhotoIcon, ArrowsPointingOutIcon, ScissorsIcon, SparklesIcon } from '@heroicons/react/24/outline';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeLogo from '@/components/ThemeLogo';

const NAV_ITEMS = [
    { path: '/', icon: HomeIcon, labelKey: 'Home' },
    { path: '/remove-bg', icon: PhotoIcon, labelKey: 'Remove BG' },
    { path: '/resize', icon: ArrowsPointingOutIcon, labelKey: 'Resize' },
    { path: '/crop', icon: ScissorsIcon, labelKey: 'Crop' },
    { path: '/enhance', icon: SparklesIcon, labelKey: 'Enhance' },
];

const Header = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);


    useEffect(() => {
        closeMobileMenu();
    }, [location.pathname]);


    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isMobileMenuOpen]);

    const navLinkClass = ({ isActive }) =>
        `nav-link ${isActive ? 'active' : ''}`;

    return (
        <>

            <header className="main-header">
                <div className="header-content">
                    <div className="header-left">
                        <NavLink to="/" className="logo" onClick={closeMobileMenu}>
                            <ThemeLogo className="h-8 w-auto" alt="ImageTools Logo" />
                            <span className="logo-text">ImageTools</span>
                        </NavLink>
                    </div>


                    <div className="nav-container-desktop">
                        <nav className="main-nav">
                            {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
                                <NavLink key={path} to={path} className={navLinkClass}>
                                    <Icon className="h-5 w-5" /> {t(labelKey)}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    <div className="header-right">
                        <div className="header-controls header-controls--desktop">
                            <LanguageSwitcher />
                            <ThemeToggle />
                        </div>


                        <button
                            className="mobile-menu-btn"
                            onClick={toggleMobileMenu}
                            aria-label="Toggle Menu"
                        >
                            <Bars3Icon />
                        </button>
                    </div>
                </div>
            </header>

            {/* Sidebar is outside <header> to avoid backdrop-filter creating a new stacking context */}
            <div
                className={`sidebar-backdrop ${isMobileMenuOpen ? 'visible' : ''}`}
                onClick={closeMobileMenu}
            />

            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>

                <div className="sidebar__header">
                    <NavLink to="/" className="logo" onClick={closeMobileMenu}>
                        <ThemeLogo className="h-8 w-auto" alt="ImageTools Logo" />
                        <span className="logo-text">ImageTools</span>
                    </NavLink>
                    <button className="sidebar__close" onClick={closeMobileMenu} aria-label="Close Menu">
                        <XMarkIcon />
                    </button>
                </div>


                <nav className="sidebar__nav">
                    <p className="sidebar__section-label">{t('Tools')}</p>
                    {NAV_ITEMS.map(({ path, icon: Icon, labelKey }) => (
                        <NavLink
                            key={path}
                            to={path}
                            className={navLinkClass}
                            onClick={closeMobileMenu}
                        >
                            <Icon className="sidebar__icon" />
                            <span>{t(labelKey)}</span>
                        </NavLink>
                    ))}
                </nav>


                <div className="sidebar__footer">
                    <div className="sidebar__controls">
                        <LanguageSwitcher />
                        <ThemeToggle />
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Header;
