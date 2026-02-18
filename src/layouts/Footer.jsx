import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="footer">
            <p>{t('FooterCopyright', { year: new Date().getFullYear() })}</p>
        </footer>
    );
};

export default Footer;
