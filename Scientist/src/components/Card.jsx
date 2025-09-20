import React from 'react';

const Card = ({ title, children, className = '', headerActions }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md border ${className}`}>
            {title && (
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                        {headerActions && <div>{headerActions}</div>}
                    </div>
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
};

export default Card;
