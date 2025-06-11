// src/pages/index.tsx
import React from 'react';

const Index = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Welcome to the Dashboard</h1>
            {user?.email && (
                <p>
                    {/* Logged in as: <strong>{user.email}</strong> */}
                </p>
            )}
        </div>
    );
};

export default Index;
