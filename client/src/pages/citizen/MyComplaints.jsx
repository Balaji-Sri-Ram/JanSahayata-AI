import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Search, 
  ListFilter, 
  RefreshCw, 
  ArrowRight, 
  AlertCircle,
  FileText,
  Clock,
  Building2,
  Calendar
} from 'lucide-react';
import { citizenApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';

const STATUS_TABS = ['All', 'Submitted', 'Under Review', 'In Progress', 'Resolved', 'Closed', 'Disputed'];

export default function MyComplaints() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  // Real-time live polling every 8s so status updates appear live
  useEffect(() => {
    const timer = setInterval(() => {
      const citizenId = user?._id || 'current';
      citizenApi.getMyComplaints(citizenId).then(res => {
        if (res.data?.success) setComplaints(res.data.data || []);
      }).catch(() => {});
    }, 8000);

    return () => clearInterval(timer);
  }, [user]);

  const fetchComplaints = async (isManual = false) => {
    try {
      if (isManual) {
        setIsRefreshing(true);
        setRefreshCountdown(3);
        const countdownTimer = setInterval(() => {
          setRefreshCountdown(prev => (prev > 1 ? prev - 1 : 1));
        }, 1000);
        setTimeout(() => clearInterval(countdownTimer), 3200);
      } else {
        setLoading(true);
      }
      const citizenId = user?._id || 'current';
      const [res] = await Promise.all([
        citizenApi.getMyComplaints(citizenId),
        isManual ? new Promise(r => setTimeout(r, 3000)) : Promise.resolve()
      ]);
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading citizen complaints:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
      setRefreshCountdown(0);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    const matchesSearch = !searchQuery.trim() || 
      c.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.generatedProblemStatement?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 gov-section-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Grievances
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and monitor all grievances submitted by your citizen account.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchComplaints(true)}
            disabled={loading || isRefreshing}
            className="gov-btn-secondary text-xs py-2 px-3"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : loading ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? `Refreshing (${refreshCountdown || 3}s)...` : 'Refresh'}</span>
          </button>

          <Link
            to="/report"
            className="gov-btn-saffron text-xs py-2 px-3.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Lodge Grievance</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="gov-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-700 text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="gov-input pl-8 py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Table / List View */}
      {loading ? (
        <div className="gov-card p-12 text-center text-slate-500 text-xs">
          Loading grievances...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="gov-card p-12 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No grievances found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery || activeTab !== 'All'
                ? 'No grievances match the specified filter or search criteria.'
                : 'Your submitted public grievances and service requests will appear here.'}
            </p>
          </div>
          <div className="pt-2">
            <Link to="/report" className="gov-btn-saffron text-xs">
              <PlusCircle className="w-4 h-4" />
              <span>Lodge Grievance</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Issue & Category</th>
                  <th>Department</th>
                  <th>Submitted Date</th>
                  <th>Status</th>
                  <th>Priority</th>
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
                        <Link to={`/complaint/${c.complaintId}`} className="hover:underline">
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

                      <td className="text-xs text-slate-700">
                        {c.department?.name || 'Department'}
                      </td>

                      <td className="text-xs text-slate-500 font-mono">
                        {dateStr}
                      </td>

                      <td>
                        <StatusBadge status={c.status} size="sm" />
                      </td>

                      <td>
                        <UrgencyBadge urgency={c.urgency} size="sm" />
                      </td>

                      <td className="text-right">
                        <Link
                          to={`/complaint/${c.complaintId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                        >
                          <span>View Details</span>
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
