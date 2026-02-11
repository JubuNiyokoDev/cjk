import React from 'react';
import Image from 'next/image';

interface MultiImageSelectorProps {
  files: File[];
  setFiles: (files: File[]) => void;
  max?: number;
  className?: string;
}

const MultiImageSelector: React.FC<MultiImageSelectorProps> = ({ files, setFiles, max = 5, className }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleBoxClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles([...files, ...newFiles].slice(0, max));
    }
  };

  const handleSelect = (idx: number) => {
    setFiles(files.map((f, i) => (i === idx ? f : f)));
  };

  const handleRemove = (idx: number) => {
    setFiles(files.filter((_, i) => i !== idx));
  };

  return (
    <div className={className}>
      <div className="flex flex-col items-center">
        <div
          className="relative w-full max-w-xs aspect-video border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer bg-gray-50 hover:border-orange-500 transition group"
          onClick={handleBoxClick}
        >
          {files.length === 0 ? (
            <span className="text-gray-400">Cliquez pour sélectionner une image</span>
          ) : (
            <Image
              src={URL.createObjectURL(files[0])}
              alt={files[0].name}
              fill
              className="rounded-xl object-contain"
              sizes="(max-width: 320px) 100vw, 320px"
            />
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            multiple={false}
          />
        </div>
        {/* Dots navigation */}
        <div className="flex gap-2 mt-2">
          {files.map((file, idx) => (
            <button
              key={idx}
              type="button"
              className={`w-3 h-3 rounded-full border-2 ${idx === 0 ? 'bg-orange-500 border-orange-500' : 'bg-gray-200 border-gray-300'} transition`}
              onClick={() => {
                // Mettre l'image sélectionnée en premier
                setFiles([
                  file,
                  ...files.filter((_, i) => i !== idx)
                ]);
              }}
              aria-label={`Sélectionner l'image ${idx + 1}`}
            />
          ))}
          {files.length > 0 && (
            <button
              type="button"
              className="ml-2 text-xs text-red-500 underline"
              onClick={() => handleRemove(0)}
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiImageSelector;
