import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Mail, RefreshCw, Trash2 } from 'lucide-react';
import { Enquiry, fetchEnquiries, updateEnquiry } from '../../utils/adminClient';

interface QueriesPanelProps {
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  onUnauthorized?: () => void;
  onStatsChange?: (stats: { total: number; unread: number }) => void;
}

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function display(value: string): string {
  return value.trim() ? value : '—';
}

function mailHref(email: string): string | null {
  if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) return null;
  return `mailto:${email}`;
}

export const QueriesPanel: React.FC<QueriesPanelProps> = ({ onShowToast, onUnauthorized, onStatsChange }) => {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [formFound, setFormFound] = useState(true);
  const [readState, setReadState] = useState<'ok' | 'unavailable'>('ok');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const onStatsChangeRef = useRef(onStatsChange);
  onStatsChangeRef.current = onStatsChange;

  const fail = useCallback((caught: unknown) => {
    if (caught instanceof Error && caught.name === 'AdminUnauthorized') {
      onUnauthorized?.();
      return;
    }
    const message = caught instanceof Error ? caught.message : 'Could not update enquiries.';
    setError(message);
    onShowToast(message, 'error');
  }, [onShowToast, onUnauthorized]);

  const publishStats = useCallback((next: Enquiry[]) => {
    onStatsChangeRef.current?.({
      total: next.length,
      unread: next.filter((row) => !row.read).length
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchEnquiries();
      setRows(result.submissions);
      setTruncated(result.truncated);
      setFormFound(result.formFound);
      setReadState(result.readState);
      publishStats(result.submissions);
    } catch (caught) {
      if (caught instanceof Error && caught.name === 'AdminUnauthorized') {
        onUnauthorized?.();
        return;
      }
      setError(caught instanceof Error ? caught.message : 'Could not load enquiries.');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized, publishStats]);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (row: Enquiry, read: boolean) => {
    setPendingId(row.id);
    try {
      await updateEnquiry('read', row.id, read);
      setRows((current) => {
        const next = current.map((item) => (item.id === row.id ? { ...item, read } : item));
        publishStats(next);
        return next;
      });
      onShowToast(read ? 'Marked as read.' : 'Marked as unread.', 'success');
    } catch (caught) {
      fail(caught);
    } finally {
      setPendingId(null);
    }
  };

  const remove = async (row: Enquiry) => {
    setPendingId(row.id);
    try {
      await updateEnquiry('delete', row.id);
      setRows((current) => {
        const next = current.filter((item) => item.id !== row.id);
        publishStats(next);
        return next;
      });
      setConfirmId(null);
      onShowToast('Enquiry deleted.', 'info');
    } catch (caught) {
      fail(caught);
    } finally {
      setPendingId(null);
    }
  };

  const visible = unreadOnly ? rows.filter((row) => !row.read) : rows;
  const unreadCount = rows.filter((row) => !row.read).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: '0 0 4px', color: 'var(--primary-color)', fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={18} /> Website enquiries
          </h3>
          <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.85rem' }}>
            {loading
              ? 'Loading the contact form inbox…'
              : error
                ? 'Inbox unavailable'
                : `${rows.length} received · ${unreadCount} unread`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="btn btn-outline"
          style={{ padding: '8px 12px', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <p style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>
        Verified submissions to the contact form, newest first. Spam held by Netlify is not listed.
        Content edits in the other tabs stay in this browser only.
      </p>

      {readState === 'unavailable' && (
        <p role="status" style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
          Read status could not be loaded. Mark read will try again when you use it.
        </p>
      )}
      {truncated && (
        <p role="status" style={{ color: '#fbbf24', fontSize: '0.85rem' }}>
          This inbox is truncated. The newest loaded page is included; some submissions in the middle of a very large archive are not shown.
        </p>
      )}
      {error && (
        <p role="alert" style={{ color: '#f87171' }}>{error}</p>
      )}

      {!loading && formFound && rows.length > 0 && (
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '1rem' }}>
          <input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} />
          Show unread only
        </label>
      )}

      {!loading && !formFound && (
        <div style={{ background: '#151d32', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ margin: 0 }}>
            Netlify has not registered the contact form on this site yet. Publish the site, submit a test enquiry, then refresh.
          </p>
        </div>
      )}

      {!loading && formFound && visible.length === 0 && !error && (
        <div style={{ background: '#151d32', border: '1px solid #334155', borderRadius: '10px', padding: '1.25rem' }}>
          <p style={{ margin: 0 }}>{unreadOnly ? 'No unread enquiries.' : 'No contact form submissions yet.'}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {visible.map((row) => {
          const busy = pendingId === row.id;
          return (
            <article
              key={row.id}
              style={{
                background: '#151d32',
                border: '1px solid #334155',
                borderLeft: row.read ? '1px solid #334155' : '4px solid var(--primary-color)',
                borderRadius: '10px',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline' }}>
                <strong style={{ color: '#fff' }}>
                  {display(row.name)}
                  {!row.read && (
                    <span style={{ marginLeft: '8px', color: '#0f172a', background: 'var(--primary-color)', borderRadius: '999px', padding: '1px 8px', fontSize: '0.7rem' }}>
                      New
                    </span>
                  )}
                </strong>
                <time dateTime={row.createdAt} style={{ color: '#94a3b8', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                  {formatWhen(row.createdAt)}
                </time>
              </div>
              <p style={{ margin: '0.35rem 0', fontSize: '0.85rem' }}>
                {mailHref(row.email) ? (
                  <a href={mailHref(row.email) ?? undefined} style={{ color: 'var(--primary-color)' }}>{row.email}</a>
                ) : display(row.email)}
                {' · '}{display(row.company)}{' · '}{display(row.service)}
              </p>
              <p style={{ margin: '0.5rem 0 0.9rem', whiteSpace: 'pre-wrap', color: '#e2e8f0' }}>{display(row.message)}</p>
              {confirmId === row.id ? (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#f87171', fontSize: '0.85rem', alignSelf: 'center' }}>Delete this enquiry permanently?</span>
                  <button type="button" onClick={() => void remove(row)} disabled={busy} style={dangerButton}>
                    <Trash2 size={14} /> Delete
                  </button>
                  <button type="button" onClick={() => setConfirmId(null)} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button type="button" onClick={() => void markRead(row, !row.read)} disabled={busy} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <Check size={14} /> {row.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button type="button" onClick={() => setConfirmId(row.id)} disabled={busy} style={dangerButton}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
};

const dangerButton: React.CSSProperties = {
  background: 'rgba(239, 68, 68, 0.15)',
  border: '1px solid rgba(239, 68, 68, 0.35)',
  color: '#f87171',
  padding: '6px 12px',
  borderRadius: '6px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '0.8rem',
  fontWeight: 600
};
