import React from 'react';

interface HtmlContentProps {
  html: string;
  className?: string;
}

/**
 * Renders HTML content safely, preserving all formatting (line breaks, lists, bullets, etc).
 * Use for all backend text fields that may contain HTML.
 */
const HtmlContent: React.FC<HtmlContentProps> = ({ html, className }) => (
  <div className={`html-content${className ? ` ${className}` : ''}`} dangerouslySetInnerHTML={{ __html: html }} />
);

export default HtmlContent;
