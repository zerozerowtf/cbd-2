import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Home, Apartment, News, Login, BookingContact, BookingSuccess, Area } from '../pages';
import { PrivateRoute } from '../components/auth/PrivateRoute';

// Admin pages
const Dashboard = lazy(() => import('../pages/admin/Dashboard').then(module => ({ default: module.Dashboard })));
const Bookings = lazy(() => import('../pages/admin/Bookings').then(module => ({ default: module.Bookings })));
const Messages = lazy(() => import('../pages/admin/Messages').then(module => ({ default: module.Messages })));
const BlockedDates = lazy(() => import('../pages/admin/BlockedDates').then(module => ({ default: module.BlockedDates })));
const Pricing = lazy(() => import('../pages/admin/Pricing').then(module => ({ default: module.Pricing })));
const Settings = lazy(() => import('../pages/admin/Settings').then(module => ({ default: module.Settings })));
const EmailTemplates = lazy(() => import('../pages/admin/EmailTemplates').then(module => ({ default: module.EmailTemplates })));
const EmailTemplatePreview = lazy(() => import('../pages/admin/EmailTemplatePreview').then(module => ({ default: module.EmailTemplatePreview })));
const EmailTest = lazy(() => import('../pages/admin/EmailTest').then(module => ({ default: module.EmailTest })));
const BlogAdmin = lazy(() => import('../pages/admin/Blog').then(module => ({ default: module.BlogAdmin })));
const BlogEditor = lazy(() => import('../pages/admin/Blog/Editor').then(module => ({ default: module.BlogEditor })));

// Blog pages
const Blog = lazy(() => import('../pages/Blog').then(module => ({ default: module.Blog })));
const BlogPost = lazy(() => import('../pages/BlogPost').then(module => ({ default: module.BlogPost })));
const PostDetail = lazy(() => import('../pages/News/PostDetail').then(module => ({ default: module.PostDetail })));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
    </div>}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/apartment" element={<Apartment />} />
        <Route path="/area" element={<Area />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<PostDetail />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/booking" element={<BookingContact />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/admin/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
        <Route path="/admin/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/admin/blocked-dates" element={<PrivateRoute><BlockedDates /></PrivateRoute>} />
        <Route path="/admin/pricing" element={<PrivateRoute><Pricing /></PrivateRoute>} />
        <Route path="/admin/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/admin/email-templates" element={<PrivateRoute><EmailTemplates /></PrivateRoute>} />
        <Route path="/admin/email-templates/:templateId" element={<PrivateRoute><EmailTemplatePreview /></PrivateRoute>} />
        <Route path="/admin/email-test" element={<PrivateRoute><EmailTest /></PrivateRoute>} />
        <Route path="/admin/blog" element={<PrivateRoute><BlogAdmin /></PrivateRoute>} />
        <Route path="/admin/blog/new" element={<PrivateRoute><BlogEditor /></PrivateRoute>} />
        <Route path="/admin/blog/edit/:id" element={<PrivateRoute><BlogEditor /></PrivateRoute>} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
