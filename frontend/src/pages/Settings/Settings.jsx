import React, { useState } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PageHeader from '../../components/layout/PageHeader';
import SectionCard from '../../components/cards/SectionCard';
import TextInput from '../../components/forms/TextInput';
import EmailInput from '../../components/forms/EmailInput';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import Toast from '../../components/toast/Toast';
import { Settings as SettingsIcon, User, Bell, Shield, Cloud } from 'lucide-react';

export default function Settings() {
  const [formData, setFormData] = useState({ firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@apexcrm.com' });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });
  const [activeTab, setActiveTab] = useState('profile');

  const handleSave = (e) => {
    e.preventDefault();
    setToast({
      isOpen: true,
      message: 'System preferences saved successfully!',
      type: 'success'
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Settings & System Preferences"
        description="Configure CRM user accounts, mail notifications, access keys, and remote endpoints."
      />

      <div className="grid gap-6 md:grid-cols-4">
        {/* Left Side Navigation Tabs */}
        <div className="md:col-span-1">
          <SectionCard className="p-3">
            <ul className="space-y-1">
              {[
                { id: 'profile', label: 'Profile Settings', icon: User },
                { id: 'alerts', label: 'System Alerts', icon: Bell },
                { id: 'security', label: 'Access & Security', icon: Shield },
                { id: 'api', label: 'API & Integrations', icon: Cloud }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors text-left ${
                        activeTab === tab.id
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </SectionCard>
        </div>

        {/* Right Side Settings Panel Details */}
        <div className="md:col-span-3">
          <form onSubmit={handleSave}>
            <SectionCard
              title={
                activeTab === 'profile'
                  ? 'CRM Profile Configuration'
                  : activeTab === 'alerts'
                  ? 'Notification Settings'
                  : activeTab === 'security'
                  ? 'Security & Access Keys'
                  : 'Third-party Integrations'
              }
              footer={
                <div className="flex justify-end">
                  <PrimaryButton type="submit">
                    Save Changes
                  </PrimaryButton>
                </div>
              }
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextInput
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    <TextInput
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                    <div className="sm:col-span-2">
                      <EmailInput
                        label="Account Email Address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-semibold text-slate-800 mb-3">Notification Preferences</h4>
                    <div className="space-y-4">
                      {[
                        { title: 'Email Alerts on New Leads', desc: 'Get notified immediately when a qualified lead enters the CRM funnel.' },
                        { title: 'Weekly Pipeline Report Summary', desc: 'Receive a compilation of active contracts, leads, and conversion metrics.' }
                      ].map((pref, idx) => (
                        <div key={idx} className="flex items-start justify-between">
                          <div>
                            <h5 className="text-xs font-bold text-slate-700">{pref.title}</h5>
                            <p className="text-[11px] text-slate-400 mt-0.5">{pref.desc}</p>
                          </div>
                          {/* Mock Switch Button Toggle */}
                          <button
                            type="button"
                            className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-indigo-600 transition-colors duration-200 ease-in-out"
                          >
                            <span className="translate-x-4 pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab !== 'profile' && (
                <div className="py-6 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                  <SettingsIcon className="mx-auto h-8 w-8 text-slate-400 mb-2 animate-spin-slow" />
                  <p className="text-sm font-semibold text-slate-700">Tab Content Pending</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    System preferences for this module will be connected to active configuration parameters.
                  </p>
                </div>
              )}
            </SectionCard>
          </form>
        </div>
      </div>

      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, isOpen: false })}
      />
    </PageContainer>
  );
}
