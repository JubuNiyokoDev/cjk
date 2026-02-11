
import React from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
  file: File | null;
  className?: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ file, className }) => {
  const [src, setSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!file) {
      setSrc(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    return () => {
      setSrc(null);
    };
  }, [file]);

  if (!file || !src) return null;

  return (
    <div className={className}>
      <div className="relative w-full max-w-xs mx-auto aspect-video mt-2">
        <Image
          src={src}
          alt={file.name}
          fill
          className="rounded-xl border border-gray-200 shadow object-contain"
          sizes="(max-width: 320px) 100vw, 320px"
        />
      </div>
      <div className="text-xs text-gray-500 text-center mt-1">{file.name}</div>
    </div>
  );
};

export default ImagePreview;
