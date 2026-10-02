import React from 'react';
import DOMPurify from 'dompurify';

interface HtmlContentProps {
  html: string;
  className?: string;
}

/**
 * Renders HTML content, preserving formatting (line breaks, lists, bullets, images, etc).
 * The HTML is sanitized with DOMPurify first so author-supplied markup cannot inject
 * scripts or event handlers into other users' sessions.
 */
const HtmlContent: React.FC<HtmlContentProps> = ({ html, className }) => {
  const clean = DOMPurify.sanitize(html ?? '');
  return (
    <div
      className={`html-content${className ? ` ${className}` : ''}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default HtmlContent;
