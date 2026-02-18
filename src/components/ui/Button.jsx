import React from 'react';
import clsx from 'clsx';

const Button = ({
    children,
    variant = 'primary',
    className,
    onClick,
    disabled = false,
    type = 'button',
    ...props
}) => {
    return (
        <button
            type={type}
            className={clsx('btn', `btn-${variant}`, className)}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
