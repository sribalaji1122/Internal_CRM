import React, { useState } from 'react';
import {
  Building2,
  Target,
  Users,
  TrendingUp,
  Megaphone,
  FileText,
  StickyNote,
  Calendar,
  Package,
  FileSpreadsheet,
  CheckSquare,
  Activity,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import StatusBadge from '../badges/StatusBadge';

export default function CompanyRelationshipTree({
  company,
  leads = [],
  contacts = [],
  deals = [],
  meetings = [],
  campaigns = [],
  documents = [],
  activities = []
}) {
  // State for toggling individual tree nodes
  const [expandedNodes, setExpandedNodes] = useState({
    root: true, // Company is expanded by default
    leads: false,
    contacts: false,
    deals: false,
    campaigns: false,
    documents: false,
    notes: false
  });

  // State for expanded deals (dealId: boolean)
  const [expandedDeals, setExpandedDeals] = useState({});

  const toggleNode = (nodeKey) => {
    setExpandedNodes(prev => ({ ...prev, [nodeKey]: !prev[nodeKey] }));
  };

  const toggleDeal = (dealId) => {
    setExpandedDeals(prev => ({ ...prev, [dealId]: !prev[dealId] }));
  };

  const renderNodeHeader = (icon, label, count, onClick, isExpanded) => {
    const Icon = icon;
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-2 py-1.5 px-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-lg cursor-pointer transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        {onClick ? (
          isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" /> : <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Icon className="h-4 w-4 text-indigo-500 shrink-0" />
        <span>{label}</span>
        {count !== undefined && (
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-850 rounded-full font-extrabold text-slate-500 border border-slate-200/40">
            {count}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm max-w-2xl">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Interactive Company Relationship Tree
      </h3>

      {/* Root Node: Company */}
      <div className="space-y-1 select-none">
        {renderNodeHeader(
          Building2,
          company?.companyName || 'Select Company',
          undefined,
          () => toggleNode('root'),
          expandedNodes.root
        )}

        {expandedNodes.root && (
          <div className="pl-6 border-l border-dashed border-slate-250 dark:border-slate-700 ml-4 space-y-2 mt-1">
            
            {/* 1. Leads Branch */}
            <div>
              {renderNodeHeader(
                Target,
                'Leads',
                leads.length,
                () => toggleNode('leads'),
                expandedNodes.leads
              )}
              {expandedNodes.leads && (
                <div className="pl-6 border-l border-dashed border-slate-250 dark:border-slate-700 ml-4 space-y-1 mt-1">
                  {leads.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic py-1 pl-2">No linked leads</div>
                  ) : (
                    leads.map(lead => (
                      <div key={lead._id} className="flex items-center justify-between text-xs py-1 px-2 bg-slate-50 dark:bg-slate-850/50 rounded border border-slate-100/50">
                        <span className="font-semibold text-slate-655">{lead.firstName} {lead.lastName}</span>
                        <StatusBadge status={lead.status} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 2. Contacts Branch */}
            <div>
              {renderNodeHeader(
                Users,
                'Contacts',
                contacts.length,
                () => toggleNode('contacts'),
                expandedNodes.contacts
              )}
              {expandedNodes.contacts && (
                <div className="pl-6 border-l border-dashed border-slate-250 dark:border-slate-700 ml-4 space-y-1 mt-1">
                  {contacts.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic py-1 pl-2">No linked contacts</div>
                  ) : (
                    contacts.map(contact => (
                      <div key={contact._id} className="flex flex-col text-xs py-1 px-2 bg-slate-50 dark:bg-slate-850/50 rounded border border-slate-100/50">
                        <span className="font-semibold text-slate-655">{contact.firstName} {contact.lastName}</span>
                        <span className="text-[9px] text-slate-400">{contact.jobTitle || 'Contact'}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 3. Deals Branch */}
            <div>
              {renderNodeHeader(
                TrendingUp,
                'Deals',
                deals.length,
                () => toggleNode('deals'),
                expandedNodes.deals
              )}
              {expandedNodes.deals && (
                <div className="pl-6 border-l border-dashed border-slate-250 dark:border-slate-700 ml-4 space-y-2 mt-1">
                  {deals.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic py-1 pl-2">No linked deals</div>
                  ) : (
                    deals.map(deal => {
                      const isDealExpanded = expandedDeals[deal._id];
                      // Filter meetings and activities related to this specific deal
                      const dealMeetings = meetings.filter(m => m.relatedLeadId === deal.leadId || m.relatedContactId === deal.primaryContactId);
                      const dealActivities = activities.filter(act => act.entityId === deal._id);

                      return (
                        <div key={deal._id} className="space-y-1">
                          <div
                            onClick={() => toggleDeal(deal._id)}
                            className="flex items-center justify-between text-xs py-1.5 px-2 bg-slate-50 dark:bg-slate-850/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded border border-slate-100/50 cursor-pointer"
                          >
                            <div className="flex items-center gap-1.5">
                              {isDealExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                              <span className="font-bold text-slate-750">{deal.dealName}</span>
                            </div>
                            <span className="font-bold text-emerald-600">${Number(deal.dealValue || 0).toLocaleString()}</span>
                          </div>

                          {isDealExpanded && (
                            <div className="pl-6 border-l border-dashed border-slate-250 dark:border-slate-700 ml-3 space-y-1">
                              {/* 3.1. Products (Placeholder) */}
                              <div className="flex items-center gap-2 py-0.5 text-[10px] text-slate-500">
                                <Package className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Products (Placeholder)</span>
                              </div>
                              {/* 3.2. Quotes (Placeholder) */}
                              <div className="flex items-center gap-2 py-0.5 text-[10px] text-slate-500">
                                <FileSpreadsheet className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Quotes (Placeholder)</span>
                              </div>
                              {/* 3.3. Meetings */}
                              <div className="flex items-center gap-2 py-0.5 text-[10px] text-slate-500">
                                <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Meetings ({dealMeetings.length})</span>
                              </div>
                              {/* 3.4. Tasks (Placeholder) */}
                              <div className="flex items-center gap-2 py-0.5 text-[10px] text-slate-500">
                                <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Tasks (Placeholder)</span>
                              </div>
                              {/* 3.5. Activity */}
                              <div className="flex items-center gap-2 py-0.5 text-[10px] text-slate-500">
                                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                                <span>Activity ({dealActivities.length})</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* 4. Campaigns Branch */}
            <div>
              {renderNodeHeader(
                Megaphone,
                'Campaigns',
                campaigns.length,
                () => toggleNode('campaigns'),
                expandedNodes.campaigns
              )}
              {expandedNodes.campaigns && (
                <div className="pl-6 border-l border-dashed border-slate-250 dark:border-slate-700 ml-4 space-y-1 mt-1">
                  {campaigns.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic py-1 pl-2">No linked campaigns</div>
                  ) : (
                    campaigns.map(camp => (
                      <div key={camp._id} className="flex items-center justify-between text-xs py-1 px-2 bg-slate-50 dark:bg-slate-850/50 rounded border border-slate-100/50">
                        <span className="font-semibold text-slate-655">{camp.name}</span>
                        <StatusBadge status={camp.status} />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 5. Documents Branch */}
            <div>
              {renderNodeHeader(
                FileText,
                'Documents',
                documents.length,
                () => toggleNode('documents'),
                expandedNodes.documents
              )}
              {expandedNodes.documents && (
                <div className="pl-6 border-l border-dashed border-slate-250 dark:border-slate-700 ml-4 space-y-1 mt-1">
                  {documents.length === 0 ? (
                    <div className="text-[10px] text-slate-400 italic py-1 pl-2">No linked documents</div>
                  ) : (
                    documents.map(doc => (
                      <div key={doc._id} className="flex items-center justify-between text-xs py-1 px-2 bg-slate-50 dark:bg-slate-850/50 rounded border border-slate-100/50">
                        <span className="font-semibold text-indigo-600 truncate max-w-[150px]">{doc.fileName}</span>
                        <span className="text-[9px] text-slate-400">{(doc.fileSize / 1024).toFixed(1)} KB</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 6. Notes Branch */}
            <div>
              {renderNodeHeader(
                StickyNote,
                'Notes',
                company.notes ? 1 : 0,
                () => toggleNode('notes'),
                expandedNodes.notes
              )}
              {expandedNodes.notes && (
                <div className="pl-6 border-l border-dashed border-slate-250 dark:border-slate-700 ml-4 space-y-1 mt-1">
                  {!company.notes ? (
                    <div className="text-[10px] text-slate-400 italic py-1 pl-2">No linked notes</div>
                  ) : (
                    <div className="text-xs p-2.5 bg-amber-50/50 dark:bg-amber-950/20 text-slate-750 dark:text-slate-300 rounded border border-amber-100/50 leading-relaxed font-medium">
                      {company.notes}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
