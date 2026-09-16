import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Inbox, 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  Eye, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { railwayApi } from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import UrgencyBadge from '../../components/UrgencyBadge';

const STATUS_LIST = [
  'All',
  'Submitted',
  'Under Review',
  'Accepted',
  'In Progress',
  'Resolved',
  'Disputed',
  'Escalated',
  'Closed'
];

const URGENCY_LIST = ['All', 'Low', 'Medium', 'High', 'Critical'];

const CATEGORY_LIST = [
  'All',
  'Pothole / Road Damage',
  'Garbage / Waste',
  'Water Leakage',
  'Broken Streetlight',
  'Drainage Problem',
  'Railway Infrastructure Damage',
  'Station Cleanliness',
  'Track / Railway Area Issue',
  'Passenger Facility Problem',
  'Other'
];

export default function RailwayComplaints() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [urgency, setUrgency] = useState(searchParams.get('urgency') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');

  useEffect(() => {
    fetchComplaints();
  }, [status, urgency, category]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (status !== 'All') params.status = status;
      if (urgency !== 'All') params.urgency = urgency;
      if (category !== 'All') params.category = category;
      if (search.trim()) params.search = search.trim();

      const res = await railwayApi.getComplaints(params);
      if (res.data?.success) {
        setComplaints(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading railway complaints:', err);
      setError('Failed to fetch complaints list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatus('All');
    setUrgency('All');
    setCategory('All');
    setSearchParams({});
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-center gap-2">
            <Inbox className="w-7 h-7 text-railway-600" />
            Railway Complaint Inbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Departmental queue of grievances routed for Railway Division inspection and technical remediation.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
          <span>Active Filtered Queue: <strong className="text-slate-900">{complaints.length}</strong> complaints</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search complaint ID / keyword / station / location..."
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-railway-500 focus:ring-2 focus:ring-railway-100 outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Multi-dropdown filter row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          
          {/* Status Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Status Filter
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:border-railway-500 outline-hidden"
            >
              {STATUS_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Urgency Level
            </label>
            <select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:border-railway-500 outline-hidden"
            >
              {URGENCY_LIST.map((ug) => (
                <option key={ug} value={ug}>
                  {ug}
                </option>
              ))}
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Problem Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 bg-white focus:border-railway-500 outline-hidden truncate"
            >
              {CATEGORY_LIST.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-1.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

        </div>

      </div>

      {/* Complaints Table & Cards */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-railway-600 mb-2" />
          Loading department inbox records...
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 text-center">
          {error}
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800 mb-1">No Railway Complaints Match Filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search query or status filter.
          </p>
          <button
            onClick={handleResetFilters}
            className="text-xs text-railway-600 font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 font-semibold">Complaint ID</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Problem / Statement</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Urgency</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((item) => {
                  const dateStr = new Date(item.createdAt).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  });

                  const isDisputed = item.status === 'Disputed';

                  return (
                    <tr
                      key={item._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isDisputed ? 'bg-rose-50/40' : ''
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.complaintId}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                        {item.category}
                      </td>

                      {/* Problem Snippet */}
                      <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={item.description}>
                        {item.description}
                      </td>

                      {/* Location */}
                      <td className="py-3 px-4 text-slate-600 max-w-[180px] truncate" title={item.location?.address}>
                        📍 {item.location?.address || 'Railway Station'}
                      </td>

                      {/* Urgency */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <UrgencyBadge urgency={item.urgency} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={item.status} size="sm" />
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {dateStr}
                      </td>

                      {/* Action View */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/railway-dashboard/complaints/${item.complaintId || item._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-2xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
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
