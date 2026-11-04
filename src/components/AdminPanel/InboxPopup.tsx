import React, { useCallback, useEffect, useId, useState } from 'react';
import { Inbox, LogOut, Settings, X } from 'lucide-react';
import { fetchEnquiries } from '../../utils/adminClient';
import { QueriesPanel } from './QueriesPanel';

interface InboxPopupProps {
  onOpenEditor: () => void;
  onLogout: () => void;
  onUnauthorized: () => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
  /** When the full side editor is open, tuck the launcher so it is not covered. */
  editorOpen?: boolean;
}

export const InboxPopup: React.FC<InboxPopupProps> = ({
  onOpenEditor,
  onLogout,
  onUnauthorized,
  onShowToast,
  editorOpen = false
}) => {
  const [open, setOpen] = useState(true);
  const [unread, setUnread] = useState(0);
  const titleId = useId();

  const refreshUnread = useCallback(async () => {
    try {
      const result = await fetchEnquiries();
      setUnread(result.submissions.filter((row) => !row.read).length);
    } catch (caught) {
      if (caught instanceof Error && caught.name === 'AdminUnauthorized') {
        onUnauthorized();
      }
    }
  }, [onUnauthorized]);

  useEffect(() => {
    void refreshUnread();
    const timer = window.setInterval(() => {
      void refreshUnread();
    }, 60_000);
    return () => window.clearInterval(timer);
  }, [refreshUnread]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (editorOpen) return null;

  return (
    <div className={`inbox-popup${open ? ' is-open' : ''}`}>
      {open && (
        <section
          className="inbox-popup-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          <header className="inbox-popup-header">
            <div>
              <p className="inbox-popup-kicker">Admin</p>
              <h2 id={titleId}>Enquiry inbox</h2>
            </div>
            <div className="inbox-popup-actions">
              <button type="button" className="inbox-popup-icon-btn" onClick={onOpenEditor} title="Open full editor">
                <Settings size={16} />
                <span>Editor</span>
              </button>
              <button type="button" className="inbox-popup-icon-btn danger" onClick={onLogout} title="Sign out">
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
              <button
                type="button"
                className="inbox-popup-icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Collapse inbox"
              >
                <X size={16} />
              </button>
            </div>
          </header>
          <div className="inbox-popup-body">
            <QueriesPanel
              onShowToast={onShowToast}
              onUnauthorized={onUnauthorized}
              onStatsChange={(stats) => setUnread(stats.unread)}
            />
          </div>
        </section>
      )}

      <button
        type="button"
        className="inbox-popup-launcher"
        aria-expanded={open}
        aria-label={open ? 'Collapse enquiry inbox' : `Open enquiry inbox${unread ? `, ${unread} unread` : ''}`}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X size={22} /> : <Inbox size={22} />}
        {!open && unread > 0 && (
          <span className="inbox-popup-badge" aria-hidden="true">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
    </div>
  );
};
