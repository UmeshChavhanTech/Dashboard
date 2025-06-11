import { lazy } from 'react';
import LoginBoxed from '../pages/LoginBoxed';
import RecoverIdBox from '../pages/RecoverIdBox';
import RegisterBoxed from '../pages/RegisterBoxed';
import RegisterCover from '../pages/RegisterCover';
import UnlockBox from '../pages/UnlockBox';
import UnlockCover from '../pages/UnlockCover';
import ProtectedRoute from '../pages/protectroute';
import Chat from '../../Chat';
import Mailbox from '../../Mailbox';
import Notes from '../../Notes';
import Todolist from '../../Todolist';
import Scrumboard from '../../Scrumboard';
import Contacts from '../../Contacts';
import Calendar from '../../Calendar';
import UserList from '../../Userlist';

//import Tables from '../../Tables';
// const Widgets = lazy(() => import('../../Widgets'));

// Lazy load Index page
const Index = lazy(() => import('../pages/Index'));

const routes = [
    // Login (default)
    {
        path: '/',
        element: <LoginBoxed />,
        layout: 'blank',
    },

    // Authentication Routes
    {
        path: '/auth/boxed-signup',
        element: <RegisterBoxed />,
        layout: 'blank',
    },
    {
        path: '/auth/boxed-lockscreen',
        element: <UnlockBox />,
        layout: 'blank',
    },
    {
        path: '/auth/boxed-password-reset',
        element: <RecoverIdBox />,
        layout: 'blank',
    },
    {
        path: '/auth/cover-login',
        element: <LoginBoxed />,
        layout: 'blank',
    },
    {
        path: '/auth/cover-register',
        element: <RegisterCover />,
        layout: 'blank',
    },
    {
        path: '/auth/cover-lockscreen',
        element: <UnlockCover />,
        layout: 'blank',
    },
    {
        path: '/auth/cover-password-reset',
        element: <RecoverIdBox />,
        layout: 'blank',
    },


    // Protected Dashboard Route
    {
        path: '/index',
        element: (
            
            <ProtectedRoute>
            <Index />
        </ProtectedRoute>
            
        ),
        layout: 'default',
    },
    // {
    //     path: '/widgets',
    //     element: (
    //         <ProtectedRoute>
    //             <Widgets />
    //         </ProtectedRoute>
    //     ),
    //     layout: 'default',
    // },
    {
        path: '/apps/chat',
        element: (
            <ProtectedRoute>
                <Chat />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/apps/mailbox',
        element: (
            <ProtectedRoute>
                <Mailbox />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/apps/notes',
        element: (
            <ProtectedRoute>
                <Notes />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/apps/todolist',
        element: (
            <ProtectedRoute>
                <Todolist />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/apps/scrumboard',
        element: (
            <ProtectedRoute>
                <Scrumboard />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/apps/contacts',
        element: (
            <ProtectedRoute>
                <Contacts />
            </ProtectedRoute>
        ),
        layout: 'default',
    },
    {
        path: '/apps/calendar',
        element: (
            <ProtectedRoute>
                <Calendar />
            </ProtectedRoute>
        ),
        layout: 'default',
    },

    {
        path: '/userlist',
        element: <UserList />,
        layout: 'default',
    },

    // {
    //     path: '/tables',
    //     element: (
    //         <ProtectedRoute>
//}
];

export { routes };
