import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import logoLight from '@/assets/images/logo-light.png';
import logoDark from '@/assets/images/logo-dark.png';

export default function ThemeLogo({ className = '', alt = 'Logo', style = {} }) {
    const { theme } = useTheme();

    return (
        <img
            src={theme === 'dark' ? logoDark : logoLight}
            alt={alt}
            className={className}
            style={style}
        />
    );
}
