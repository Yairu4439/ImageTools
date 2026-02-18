import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLocale = () => {
        const newLocale = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLocale);
    };

    return (
        <Button
            variant="ghost"
            onClick={toggleLocale}
            className="btn-icon font-bold"
            aria-label="Toggle Language"
        >
            {i18n.language === 'es' ? 'EN' : 'ES'}
        </Button>
    );
}
