import React, { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';

export function openInApp(event: React.MouseEvent<HTMLAnchorElement>, action: () => void) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
  event.preventDefault();
  action();
}

export function EditorialPage({ page, children }: { page: string; children: React.ReactNode }) {
  return (
    <main className="editorial-page" id="main-content" data-page={page}>
      {children}
    </main>
  );
}

export function EditorialTopbar({
  crumb,
  onBack,
  action
}: {
  crumb: string;
  onBack: () => void;
  action?: React.ReactNode;
}) {
  return (
    <div className="editorial-topbar">
      <div className="editorial-topbar-inner">
        <a href="/" className="editorial-back" onClick={(event) => openInApp(event, onBack)}>
          <ArrowLeft size={16} aria-hidden="true" /> Back to Agency Home
        </a>
        <nav className="editorial-crumbs" aria-label="Breadcrumb">
          <span>Home</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{crumb}</span>
        </nav>
        {action}
      </div>
    </div>
  );
}

export function EditorialHero({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="editorial-hero">
      <div className="editorial-hero-inner">
        <p className="editorial-kicker">{eyebrow}</p>
        <h1>{title}</h1>
        {description ? <p className="editorial-lead">{description}</p> : null}
        {children}
      </div>
    </header>
  );
}

export function EditorialSection({
  id,
  eyebrow,
  title,
  description,
  children,
  narrow = false
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <section className="editorial-section" id={id} aria-labelledby={title && id ? `${id}-title` : undefined}>
      <div className={narrow ? 'editorial-wrap editorial-wrap-narrow' : 'editorial-wrap'}>
        {title ? (
          <div className="editorial-section-head">
            {eyebrow ? <p className="editorial-eyebrow">{eyebrow}</p> : null}
            <h2 id={id ? `${id}-title` : undefined}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function EditorialCta({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="editorial-cta" aria-labelledby="editorial-cta-title">
      <div className="editorial-wrap editorial-wrap-narrow">
        <h2 id="editorial-cta-title">{title}</h2>
        <p>{description}</p>
        <div className="editorial-cta-actions">{children}</div>
      </div>
    </section>
  );
}

export function EditorialPills({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: { id: string; label: string; count?: number }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="editorial-pills" role="group" aria-label={label}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            className={`editorial-pill${selected ? ' is-selected' : ''}`}
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
          >
            <span>{option.label}</span>
            {typeof option.count === 'number' ? (
              <span className="editorial-pill-count">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function EditorialSearch({
  id,
  label,
  value,
  onChange,
  placeholder
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="editorial-search" role="search">
      <label className="visually-hidden" htmlFor={id}>
        {label}
      </label>
      <Search size={18} aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {value ? (
        <button type="button" className="editorial-search-clear" onClick={() => onChange('')}>
          Clear
        </button>
      ) : null}
    </div>
  );
}

export function EditorialEmpty({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="editorial-empty" role="status">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function EditorialImage({
  src,
  alt,
  loading = 'lazy'
}: {
  src?: string;
  alt: string;
  loading?: 'lazy' | 'eager';
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="editorial-media-fallback" role="img" aria-label={alt}>
        {alt}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
