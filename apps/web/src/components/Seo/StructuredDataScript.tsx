import React from 'react';

interface StructuredDataScriptProps {
  data: Record<string, any> | Array<Record<string, any>>;
}

export const StructuredDataScript: React.FC<StructuredDataScriptProps> = ({ data }) => {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
};
