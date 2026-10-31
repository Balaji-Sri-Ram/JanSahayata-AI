import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Inbox, 
  Search, 
  RefreshCw, 
  ArrowRight, 
  Building2, 
  AlertCircle,
  Filter
} from 'lucide-react';
import { staffApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';

const STATUS_TABS = ['All', 'Submitted', 'Under Review', 'Accepted', 'In Progress', 'Resolved', 'Disputed', 'Escalated', 'Closed'];

export default function StaffComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [error, setError] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, urgencyFilter]);

  // Real-time live polling (every 8s)
  useEffect(() => {
    const timer = setInterval(() => {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (urgencyFilter !== 'All') params.urgency = urgencyFilter;
      staffApi.getComplaints(params).then(res => {
        if (res.data?.success) setComplaints(res.data.data || []);
      }).catch(() => {});
    }, 8000);

    return () => clearInterval(timer);
  }, [statusFilter, urgencyFilter]);

  const fetchComplaints = async (isManual = false) => {
    try {
      if (isManual) {
        setIsRefreshing(true);
        setRefreshCountdown(3);
        const timer = setInterval(() => {
          setRefreshCountdown(prev => (prev > 1 ? prev - 1 : 1));
        }, 1000);
        setTimeout(() => clearInterval(timer), 3200);
      } else {
        setLoading(true);
      }
      setError(null);
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (urgencyFilter !== 'All') params.urgency = urgencyFilter;

      const [res] = await Promise.all([
        staffApi.getComplaints(params),
        isManual ? new Promise(r => setTimeout(r, 3000)) : Promise.resolve()
      ]);
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching staff complaints:', err);
      setError('Failed to retrieve department complaints.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setRefreshCountdown(0);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.complaintId?.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.generatedProblemStatement?.toLowerCase().includes(query) ||
      c.category?.toLowerCase().includes(query) ||
      c.location?.address?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 gov-section-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[11px]">
              {user?.department?.name || 'Department Inbox'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Department Grievance Queue
          </h1>
          <p className="text-xs text-slate-500">
            Inspect incoming grievances, update field statuses, and record verified resolutions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchComplaints(true)}
            disabled={loading || isRefreshing}
            className="gov-btn-secondary text-xs py-2 px-3"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : loading ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? `Refreshing (${refreshCountdown || 3}s)...` : 'Refresh'}</span>
          </button>

          <Link
            to="/staff/dashboard"
            className="gov-btn-secondary text-xs py-2 px-3"
          >
            Overview
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="gov-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {STATUS_TABS.map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID, category, or area..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gov-input pl-8 py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Urgency Filter Row */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] font-medium text-slate-500">Urgency:</span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((urg) => (
            <button
              key={urg}
              onClick={() => setUrgencyFilter(urg)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                urgencyFilter === urg
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {urg}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Department Complaints */}
      {loading ? (
        <div className="gov-card p-12 text-center text-xs text-slate-400">Loading department queue...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="gov-card p-12 text-center space-y-3">
          <p className="text-sm font-bold text-slate-800">No grievances in this queue</p>
          <p className="text-xs text-slate-500">New grievances routed to your department will appear here.</p>
        </div>
      ) : (
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Category & Problem Statement</th>
                  <th>Location</th>
                  <th>Submitted Date</th>
                  <th>Urgency</th>
                  <th>Status</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((c) => {
                  const dateStr = new Date(c.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-mono font-bold text-blue-900 text-xs">
                        <Link to={`/staff/complaints/${c.complaintId}`} className="hover:underline">
                          {c.complaintId}
                        </Link>
                      </td>

                      <td className="max-w-xs">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {c.category}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {c.generatedProblemStatement || c.description}
                        </p>
                      </td>

                      <td className="text-xs text-slate-600 max-w-[180px] truncate">
                        {c.location?.address}
                      </td>

                      <td className="text-xs text-slate-500 font-mono">
                        {dateStr}
                      </td>

                      <td>
                        <UrgencyBadge urgency={c.urgency} size="sm" />
                      </td>

                      <td>
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      <td className="text-right">
                        <Link
                          to={`/staff/complaints/${c.complaintId}`}
                          className="gov-btn-primary text-xs py-1.5 px-3"
                        >
                          <span>Process</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
