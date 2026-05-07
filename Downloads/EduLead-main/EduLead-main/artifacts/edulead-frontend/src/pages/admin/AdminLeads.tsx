import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../lib/axios';
import { getCategoryLabel, getScoreColor } from '../../lib/scoring';
import { BookOpen, Plus, ChevronRight } from 'lucide-react';

const KERALA_DISTRICTS = ['Thiruvananthapuram','Kollam','Pathanamthitta','Alappuzha','Kottayam','Idukki','Ernakulam','Thrissur','Palakkad','Malappuram','Kozhikode','Wayanad','Kannur','Kasaragod'];

export default function AdminLeads() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: '', location: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-leads', page, filters],
    queryFn: () => api.get('/admin/leads/', { params: { page, ...filters } }).then((r) => r.data),
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">All Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">{data?.count ?? 0} total leads</p>
        </div>
        <Link to="/admin/leads/new"
          className="flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#162d4a] transition-colors">
          <Plus className="w-4 h-4" /> Add Lead
        </Link>
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]">
          <option value="">All Categories</option>
          <option value="hot">Hot</option>
          <option value="warm">Warm</option>
          <option value="cold">Cold</option>
        </select>
        <select value={filters.location} onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          className="border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]">
          <option value="">All Districts</option>
          {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-border sticky top-0">
            <tr>
              {['Name', 'Course', 'Location', 'Score', 'Category', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-border">
                    {[...Array(7)].map((_, j) => <td key={j} className="px-4 py-3"><div className="skeleton h-4 rounded w-20" /></td>)}
                  </tr>
                ))
              : data?.results?.map((lead: any) => {
                  const cat = getCategoryLabel(lead.score);
                  return (
                    <tr key={lead.id} onClick={() => navigate(`/admin/leads/${lead.id}`)}
                      className="border-b border-border hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 font-medium">{lead.student_name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{lead.course_interest}</td>
                      <td className="px-4 py-3 text-muted-foreground">{lead.location}</td>
                      <td className={`px-4 py-3 font-bold ${getScoreColor(lead.score)}`}>{lead.score}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cat.className}`}>{cat.label}</span>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted-foreground text-xs">{lead.status}</td>
                      <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                    </tr>
                  );
                })}
          </tbody>
        </table>
        {!isLoading && (!data?.results || data.results.length === 0) && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No leads found</p>
          </div>
        )}
      </div>

      {data && data.count > 20 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">Page {page} of {Math.ceil(data.count / 20)}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 border border-border rounded text-sm disabled:opacity-40 hover:bg-gray-50">Prev</button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= Math.ceil(data.count / 20)}
              className="px-3 py-1.5 border border-border rounded text-sm disabled:opacity-40 hover:bg-gray-50">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
