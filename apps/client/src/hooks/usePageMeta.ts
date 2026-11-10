import { useEffect } from 'react';

const META_DESCRIPTION_ID = 'page-meta-description';

export function usePageMeta(title: string, description?: string): void {
  useEffect(() => {
    document.title = title;
    if (description) {
      let meta = document.querySelector<HTMLMetaElement>(
        `meta[name="description"]#${META_DESCRIPTION_ID}`,
      );
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        meta.id = META_DESCRIPTION_ID;
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
}
