import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Trash2, UploadCloud } from 'lucide-react';
import {
  estimateDataUrlSizeKb,
  isUploadedDataUrl,
  processImageFileToDataUrl,
  sanitizeDisplayImageUrl
} from '../../utils/imageUpload';

interface ImageUploadFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (nextUrl: string) => void;
  onError: (message: string) => void;
  previewFallbackText?: string;
  shape?: 'circle' | 'rounded';
  maxDimension?: number;
  urlPlaceholder?: string;
  helperText?: string;
  uploadButtonLabel?: string;
}

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  id,
  label,
  value,
  onChange,
  onError,
  previewFallbackText = 'AX',
  shape = 'circle',
  maxDimension = 480,
  urlPlaceholder = 'https://example.com/photo.jpg',
  helperText,
  uploadButtonLabel = 'Upload Image'
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const safePreviewSrc = sanitizeDisplayImageUrl(value);
  const uploadedData = isUploadedDataUrl(value);

  useEffect(() => {
    setPreviewError(false);
  }, [safePreviewSrc]);

  const handleSelectedFile = async (file: File | undefined | null) => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFileToDataUrl(file, { maxDimension });
      setPreviewError(false);
      onChange(dataUrl);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Unable to upload image.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFile = event.dataTransfer?.files?.[0];
    void handleSelectedFile(droppedFile);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label
        htmlFor={`${id}-url`}
        style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '6px' }}
      >
        {label}
      </label>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          background: '#1a1a1a',
          border: `1px dashed ${isDragging ? 'var(--primary-color)' : 'rgba(212, 175, 55, 0.35)'}`,
          borderRadius: '10px',
          padding: '0.85rem',
          transition: 'border-color 0.2s ease, background 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Live Preview Thumbnail */}
          <div
            style={{
              width: shape === 'rounded' ? '96px' : '64px',
              height: '64px',
              borderRadius: shape === 'rounded' ? '10px' : '50%',
              background: '#0a0a0a',
              border: '2px solid var(--primary-color)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--primary-color)',
              fontWeight: 700,
              fontSize: shape === 'rounded' ? '0.9rem' : '1.05rem'
            }}
          >
            {safePreviewSrc && !previewError ? (
              <img
                src={safePreviewSrc}
                alt={`${label} preview`}
                onError={() => setPreviewError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <span>{previewFallbackText || <ImageIcon size={20} />}</span>
            )}
          </div>

          {/* Upload Actions */}
          <div style={{ flex: 1, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                ref={fileInputRef}
                id={`${id}-file`}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                aria-label={`${label} file upload`}
                onChange={(event) => {
                  void handleSelectedFile(event.target.files?.[0]);
                }}
                style={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0
                }}
              />

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-primary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  opacity: isProcessing ? 0.7 : 1
                }}
              >
                <UploadCloud size={14} />
                {isProcessing ? 'Processing...' : value ? `Replace ${uploadButtonLabel.replace(/^Upload\s*/i, '')}` : uploadButtonLabel}
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewError(false);
                    onChange('');
                  }}
                  aria-label={`Remove ${label}`}
                  style={{
                    background: 'rgba(239, 68, 68, 0.14)',
                    border: '1px solid rgba(239, 68, 68, 0.35)',
                    color: '#f87171',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.76rem',
                    fontWeight: 600
                  }}
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}

              {uploadedData && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--primary-color)',
                    background: 'rgba(212, 175, 55, 0.12)',
                    border: '1px solid rgba(212, 175, 55, 0.35)',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    fontWeight: 600
                  }}
                >
                  Uploaded ({estimateDataUrlSizeKb(value)} KB)
                </span>
              )}
            </div>

            <p style={{ margin: 0, fontSize: '0.72rem', color: '#a8a29e' }}>
              {helperText || 'Drag & drop or upload PNG, JPG, or WebP from your device, or paste an image URL below.'}
            </p>
          </div>
        </div>

        {/* Optional External URL Input */}
        <div style={{ marginTop: '0.75rem' }}>
          <input
            id={`${id}-url`}
            type="text"
            aria-label={`${label} URL`}
            placeholder={uploadedData ? 'Uploaded image active (or paste an external https:// URL to replace)' : urlPlaceholder}
            value={uploadedData ? '' : value}
            onChange={(event) => {
              setPreviewError(false);
              onChange(event.target.value);
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '6px',
              background: '#111111',
              border: '1px solid #2e2e2e',
              color: '#fff',
              fontSize: '0.8rem'
            }}
          />
        </div>
      </div>
    </div>
  );
};
