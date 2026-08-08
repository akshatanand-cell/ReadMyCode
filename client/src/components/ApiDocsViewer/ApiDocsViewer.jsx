import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { repoAPI } from '@/services/api';

export default function ApiDocsViewer({ repoId, content }) {
  const [docs, setDocs] = useState(content || null);
  const [loading, setLoading] = useState(!content);
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!content && repoId) {
      fetchDocs();
    }
  }, [repoId, content]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await repoAPI.getApiDocs(repoId);
      setDocs(res.data.docs);
      if (res.data.docs?.endpoints?.length > 0) {
        setSelectedEndpoint(res.data.docs.endpoints[0]);
      }
    } catch (err) {
      console.error('Failed to fetch API docs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner text="Generating API documentation..." />;

  if (!docs || !docs.endpoints || docs.endpoints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-text-secondary">
        <svg className="w-16 h-16 mb-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-lg font-medium text-text-primary">No API endpoints detected</p>
        <p className="text-sm mt-1 text-text-muted">This repository may not expose a web API</p>
      </div>
    );
  }

  const filteredEndpoints = docs.endpoints.filter(ep => 
    ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ep.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const methodColors = {
    GET: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    PUT: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    PATCH: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    DELETE: 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-background-secondary/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="font-semibold text-text-primary">API Documentation</h2>
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full border border-primary/30">
              {docs.endpoints.length} endpoints
            </span>
          </div>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            Export PDF
          </Button>
        </div>
        
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search endpoints..."
          className="w-full px-4 py-2 bg-background border border-border rounded-lg text-text-primary placeholder-text-muted focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden min-h-[500px]">
        {/* Sidebar - Endpoint List */}
        <div className="w-80 border-r border-border overflow-y-auto bg-background/50">
          {filteredEndpoints.map((ep, i) => (
            <button
              key={i}
              onClick={() => setSelectedEndpoint(ep)}
              className={`w-full text-left px-4 py-3 border-b border-border/50 hover:bg-background-secondary/50 transition ${
                selectedEndpoint === ep ? 'bg-background-secondary border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${methodColors[ep.method] || 'bg-background-secondary text-text-secondary'}`}>
                  {ep.method}
                </span>
                <span className="text-sm font-mono text-text-primary truncate">{ep.path}</span>
              </div>
              <p className="text-xs text-text-secondary truncate">{ep.description || 'No description'}</p>
            </button>
          ))}
        </div>

        {/* Detail View */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {selectedEndpoint ? (
            <div className="max-w-3xl space-y-6">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${methodColors[selectedEndpoint.method] || 'bg-background-secondary text-text-secondary'}`}>
                  {selectedEndpoint.method}
                </span>
                <code className="text-lg font-mono text-text-primary bg-background-secondary border border-border px-3 py-1 rounded-lg">
                  {selectedEndpoint.path}
                </code>
              </div>

              {/* Description */}
              <section>
                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Description</h3>
                <p className="text-text-primary">{selectedEndpoint.description || 'No description available.'}</p>
              </section>

              {/* Parameters */}
              {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                <section>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Parameters</h3>
                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <table className="w-full text-sm">
                      <thead className="bg-background-secondary/50">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-text-secondary">Name</th>
                          <th className="px-4 py-2 text-left font-medium text-text-secondary">Type</th>
                          <th className="px-4 py-2 text-left font-medium text-text-secondary">Required</th>
                          <th className="px-4 py-2 text-left font-medium text-text-secondary">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {selectedEndpoint.parameters.map((param, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2 font-mono text-text-primary">{param.name}</td>
                            <td className="px-4 py-2 text-text-secondary">{param.type}</td>
                            <td className="px-4 py-2">
                              {param.required ? (
                                <span className="text-rose-400 font-medium text-xs">Required</span>
                              ) : (
                                <span className="text-text-muted text-xs">Optional</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-text-secondary">{param.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Request Body */}
              {selectedEndpoint.requestBody && (
                <section>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Request Body</h3>
                  <pre className="p-4 bg-background-secondary rounded-xl font-mono text-sm text-text-primary border border-border overflow-x-auto">
                    {JSON.stringify(selectedEndpoint.requestBody, null, 2)}
                  </pre>
                </section>
              )}

              {/* Response */}
              {selectedEndpoint.response && (
                <section>
                  <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Response</h3>
                  <pre className="p-4 bg-background-secondary rounded-xl font-mono text-sm text-emerald-400 border border-border overflow-x-auto">
                    {JSON.stringify(selectedEndpoint.response, null, 2)}
                  </pre>
                </section>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-text-muted">
              Select an endpoint to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}