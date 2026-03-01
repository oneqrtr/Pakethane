import { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (urlOrDataUrl: string) => void;
  placeholder?: string;
}

export function ImageUploadField({ label, value, onChange, placeholder = 'https://... veya dosya yükleyin' }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => inputRef.current?.click()}
          title="Dosyadan yükle"
        >
          <Upload className="h-4 w-4" />
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {value && (
        <div className="mt-2 rounded border overflow-hidden bg-muted/30 inline-block max-w-[200px]">
          <img src={value} alt="" className="w-full h-24 object-contain" />
        </div>
      )}
    </div>
  );
}
