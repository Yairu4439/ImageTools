import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';

const NotFound = () => {
    const { t } = useTranslation();

    return (
        <div className="not-found">
            <div className="not-found__icon">
                <ExclamationTriangleIcon />
            </div>

            <h1 className="not-found__code">404</h1>
            <h2 className="not-found__title">{t('Page Not Found')}</h2>
            <p className="not-found__message">
                {t('The page you are looking for does not exist.')}
            </p>

            <Link to="/">
                <Button variant="primary">
                    <HomeIcon className="h-5 w-5" /> {t('Back to Home')}
                </Button>
            </Link>
        </div>
    );
};

export default NotFound;
