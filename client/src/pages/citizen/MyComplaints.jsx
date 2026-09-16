import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ListFilter, 
  Search, 
  PlusCircle, 
  Train, 
  MapPin, 
  Calendar, 
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Inbox
} from 'lucide-react';
import { citizenApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters and search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await citizenApi.getMyComplaints('CITIZEN-DEMO-001');
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Failed to load complaints from the server.');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter((item) => {
    // Status Filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active' && ['Closed', 'Resolved'].includes(item.status)) return false;
      if (statusFilter === 'Resolved' && item.status !== 'Resolved' && item.status !== 'Closed') return false;
      if (!['Active', 'Resolved'].includes(statusFilter) && item.status !== statusFilter) return false;
    }

    // Urgency Filter
    if (urgencyFilter !== 'All' && item.urgency !== urgencyFilter) {
      return false;
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = item.complaintId?.toLowerCase().includes(q);
      const matchCat = item.category?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchLoc = item.location?.address?.toLowerCase().includes(q);
      return matchId || matchCat || matchDesc || matchLoc;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
            <ListFilter className="w-7 h-7 text-railway-600" />
            My Submitted Complaints
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status tracking, investigation updates, and resolution verification.
          </p>
        </div>

        <Link
          to="/report-problem"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-railway-600 hover:bg-railway-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {/* Search box */}
          <div className="relative md:col-span-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, category, or station..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-railway-500 focus:ring-2 focus:ring-railway-100 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          {/* Status filter pills */}
          <div className="flex flex-wrap items-center gap-1.5 md:col-span-2">
            {['All', 'Active', 'In Progress', 'Resolved', 'Disputed', 'Escalated'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Complaints List / Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-railway-600 mb-2" />
          Fetching complaints from database...
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">
          {error}
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 mb-1">No Complaints Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {search || statusFilter !== 'All' 
              ? 'No complaints matched your current filters. Try resetting filters.' 
              : 'You have not submitted any complaints yet.'}
          </p>
          {(search || statusFilter !== 'All') && (
            <button
              onClick={() => { setSearch(''); setStatusFilter('All'); setUrgencyFilter('All'); }}
              className="text-xs text-railway-600 font-semibold hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredComplaints.map((complaint) => {
            const dateStr = new Date(complaint.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });

            const lastUpdated = complaint.updatedAt 
              ? new Date(complaint.updatedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })
              : dateStr;

            const isResolvedPending = complaint.status === 'Resolved' && !complaint.verification?.isVerified;

            return (
              <div
                key={complaint._id}
                className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isResolvedPending 
                    ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20' 
                    : 'border-slate-200 hover:border-railway-300'
                }`}
              >
                <div>
                  {/* Top Bar: ID + Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {complaint.complaintId}
                    </span>
                    <StatusBadge status={complaint.status} size="sm" />
                  </div>

                  {/* Category & Title */}
                  <h3 className="text-sm font-bold text-slate-900 font-['Outfit'] mb-1">
                    {complaint.category}
                  </h3>

                  {/* Description snippet */}
                  <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                    {complaint.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mb-4">
                    <UrgencyBadge urgency={complaint.urgency} size="sm" />
                    <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600 truncate max-w-[200px]" title={complaint.location?.address}>
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{complaint.location?.address || 'Railway Station'}</span>
                    </span>
                  </div>

                  {/* Action banner if Resolved pending verification */}
                  {isResolvedPending && (
                    <div className="mb-3 p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
                      <span className="font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Officer marked Resolved. Confirm?
                      </span>
                    </div>
                  )}

                  {/* Action banner if Disputed */}
                  {complaint.status === 'Disputed' && (
                    <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Resolution disputed. Under active re-investigation.</span>
                    </div>
                  )}
                </div>

                {/* Footer dates & View Details link */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="space-y-0.5">
                    <div>Submitted: <span className="text-slate-600 font-medium">{dateStr}</span></div>
                    <div>Last Updated: <span className="text-slate-600 font-medium">{lastUpdated}</span></div>
                  </div>

                  <Link
                    to={`/complaint/${complaint.complaintId || complaint._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-railway-50 hover:bg-railway-100 text-railway-700 font-semibold text-xs border border-railway-200 transition-colors"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
