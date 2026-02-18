import React from 'react';
import { Card, Button } from '@/components/ui';
import { Link } from 'react-router-dom';
import { PhotoIcon, ScissorsIcon, ArrowsPointingOutIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import ThemeLogo from '@/components/ThemeLogo';

const Home = () => {
    const { t } = useTranslation();

    const tools = [
        {
            title: t('Remove Background'),
            description: t('Remove image backgrounds automatically using AI.'),
            icon: PhotoIcon,
            path: '/remove-bg',
        },
        {
            title: t('Resize Image'),
            description: t('Resize images to specific dimensions or percentages.'),
            icon: ArrowsPointingOutIcon,
            path: '/resize',
        },
        {
            title: t('Crop Image'),
            description: t('Crop images to exact aspect ratios or custom dimensions.'),
            icon: ScissorsIcon,
            path: '/crop',
        },
        {
            title: t('Enhance Image'),
            description: t('Sharpen, adjust contrast, brightness and saturation.'),
            icon: SparklesIcon,
            path: '/enhance',
        }
    ];

    return (
        <div className="page-container">
            <div className="home-hero">
                <ThemeLogo className="home-hero__logo" alt="ImageTools Logo" />
                <h1>{t('Professional Image Tools')}</h1>
                <p>{t('Process your images securely in your browser. No server uploads.')}</p>
            </div>

            <div className="tool-grid">
                {tools.map((tool) => (
                    <Link key={tool.path} to={tool.path} className="tool-card-link">
                        <Card className="tool-card">
                            <div className="tool-card__header">
                                <div className="tool-card-icon">
                                    <tool.icon className="h-5 w-5 text-primary" />
                                </div>
                                <h2>{tool.title}</h2>
                            </div>
                            <p>{tool.description}</p>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Home;
