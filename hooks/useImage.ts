import { useState, useEffect } from 'react';
import { getImage } from '../services/db';

export const useImage = (imageId: string | null | undefined) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!imageId) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);
    
    getImage(imageId).then(dataUrl => {
      if (isMounted && dataUrl) {
        setImageUrl(dataUrl);
      }
    }).catch(error => {
      console.error(`Failed to load image ${imageId}`, error);
    }).finally(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, [imageId]);

  return { imageUrl, isLoading };
};
