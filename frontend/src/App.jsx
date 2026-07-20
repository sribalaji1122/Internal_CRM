import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

// Route-level Lazy Loading
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Leads = lazy(() => import('./pages/Leads/Leads'));
const Contacts = lazy(() => import('./pages/Contacts/Contacts'));
const Meetings = lazy(() => import('./pages/Meetings/Meetings'));
const Campaigns = lazy(() => import('./pages/Campaigns/Campaigns'));
const Companies = lazy(() => import('./pages/Companies/Companies'));
const Deals = lazy(() => import('./pages/Deals/Deals'));
const Tasks = lazy(() => import('./pages/Tasks/Tasks'));
const Calendar = lazy(() => import('./pages/Calendar/Calendar'));
const Settings = lazy(() => import('./pages/Settings/Settings'));

// Sales Modules Lazy Loading
const Products = lazy(() => import('./pages/Products/Products'));
const ProductDetails = lazy(() => import('./pages/Products/ProductDetails'));
const Quotes = lazy(() => import('./pages/Quotes/Quotes'));
const QuoteDetails = lazy(() => import('./pages/Quotes/QuoteDetails'));
const Inventory = lazy(() => import('./pages/Inventory/Inventory'));

// BI Modules Lazy Loading
const Reports = lazy(() => import('./pages/Reports/Reports'));
const RoleDashboards = lazy(() => import('./pages/Reports/RoleDashboards'));
const Exports = lazy(() => import('./pages/Reports/Exports'));

// Loading Fallback Component
const PageLoader = () => (
  <div className="flex h-[70vh] w-full items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      <span className="text-xs font-semibold text-slate-400">Loading module...</span>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="meetings" element={<Meetings />} />
            <Route path="campaigns" element={<Campaigns />} />
            <Route path="companies" element={<Companies />} />
            <Route path="deals" element={<Deals />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:id" element={<ProductDetails />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="quotes/:id" element={<QuoteDetails />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="reports" element={<Reports />} />
            <Route path="bi-dashboards" element={<RoleDashboards />} />
            <Route path="exports" element={<Exports />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
