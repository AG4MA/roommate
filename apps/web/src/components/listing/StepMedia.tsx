'use client';

import { useState } from 'react';
import type { ListingFormData } from '@/app/pubblica/page';
import {
  Upload, X, Video, Plus, User, GripVertical, AlertCircle, Loader2,
  Mail, Phone, MessageSquare
} from 'lucide-react';

interface StepMediaProps {
  data: ListingFormData;
  onChange: (updates: Partial<ListingFormData>) => void;
}

export function StepMedia({ data, onChange }: StepMediaProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setUploadError('');

    try {
      const newImages = [...data.images];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) {
          setUploadError('Le immagini devono essere inferiori a 5MB');
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();

        if (json.success) {
          newImages.push({ url: json.data.url, thumbnailUrl: json.data.thumbnailUrl, caption: '' });
        } else {
          setUploadError(json.error || 'Errore durante il caricamento');
        }
      }

      onChange({ images: newImages });
    } catch {
      setUploadError('Errore di connessione durante il caricamento');
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const updated = data.images.filter((_, i) => i !== index);
    onChange({ images: updated });
  };

  const updateCaption = (index: number, caption: string) => {
    const updated = data.images.map((img, i) => (i === index ? { ...img, caption } : img));
    onChange({ images: updated });
  };

  // Roommate management
  const addRoommate = () => {
    onChange({ roommates: [...data.roommates, { name: '', age: undefined, gender: '', occupation: '', bio: '' }] });
  };

  const updateRoommate = (index: number, updates: Partial<ListingFormData['roommates'][0]>) => {
    const updated = data.roommates.map((r, i) => (i === index ? { ...r, ...updates } : r));
    onChange({ roommates: updated });
  };

  const removeRoommate = (index: number) => {
    const updated = data.roommates.filter((_, i) => i !== index);
    onChange({ roommates: updated });
  };

  return (
    <div className="space-y-5">
      {/* Card: Foto della stanza */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-1">📸 Foto della stanza</h3>
        <p className="text-sm text-gray-500 mb-4">
          Carica fino a 10 foto. La prima sarà la copertina. Max 5MB per foto.
        </p>

        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {data.images.map((img, idx) => (
            <div key={idx} className="relative group">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || `Foto ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
              <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" />
              </button>
              {idx === 0 && (
                <span className="absolute top-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-lg font-medium">Copertina</span>
              )}
              <input type="text" value={img.caption || ''} onChange={(e) => updateCaption(idx, e.target.value)} placeholder="Didascalia (opzionale)" className="mt-2 w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
          ))}

          {data.images.length < 10 && (
            <label className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              {uploading ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500 font-medium">Carica foto</span>
                  <span className="text-xs text-gray-400 mt-1">{data.images.length}/10</span>
                </>
              )}
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>

        {data.images.length > 1 && (
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <GripVertical className="w-3 h-3" />
            Trascina le foto per riordinare (prossimamente)
          </p>
        )}
      </div>

      {/* Card: Video tour */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          <Video className="w-5 h-5 inline-block mr-2" />
          🎬 Video tour
        </h3>
        <p className="text-sm text-gray-500 mb-4">Aggiungi un link YouTube o Vimeo per mostrare la stanza</p>
        <input type="url" value={data.videoUrl} onChange={(e) => onChange({ videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500" />
      </div>

      {/* Card: Coinquilini attuali */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          <User className="w-5 h-5 inline-block mr-2" />
          👥 Coinquilini attuali
        </h3>
        <p className="text-sm text-gray-500 mb-4">Aggiungi informazioni sui coinquilini già presenti</p>

        <div className="space-y-4">
          {data.roommates.map((rm, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-gray-600">Coinquilino {idx + 1}</span>
                <button type="button" onClick={() => removeRoommate(idx)} className="text-red-500 hover:text-red-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <input type="text" value={rm.name} onChange={(e) => updateRoommate(idx, { name: e.target.value })} placeholder="Nome" className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <input type="number" value={rm.age ?? ''} onChange={(e) => updateRoommate(idx, { age: e.target.value ? parseInt(e.target.value) : undefined })} placeholder="Età" className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                <select value={rm.gender || ''} onChange={(e) => updateRoommate(idx, { gender: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">Genere</option>
                  <option value="MALE">Uomo</option>
                  <option value="FEMALE">Donna</option>
                </select>
                <select value={rm.occupation || ''} onChange={(e) => updateRoommate(idx, { occupation: e.target.value })} className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white">
                  <option value="">Occupazione</option>
                  <option value="Studente">Studente</option>
                  <option value="Lavoratore">Lavoratore</option>
                </select>
              </div>
              <textarea value={rm.bio || ''} onChange={(e) => updateRoommate(idx, { bio: e.target.value })} placeholder="Breve descrizione..." rows={2} maxLength={200} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" />
              {rm.bio && <p className="text-xs text-gray-400 text-right mt-1">{rm.bio.length}/200</p>}
            </div>
          ))}

          {data.roommates.length < 5 && (
            <button type="button" onClick={addRoommate} className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors w-full justify-center">
              <Plus className="w-5 h-5" />
              Aggiungi coinquilino
            </button>
          )}
        </div>
      </div>

      {/* Card: Preferenza contatto */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-1">📞 Come vuoi essere contattato?</h3>
        <p className="text-sm text-gray-500 mb-4">Scegli come preferisci ricevere i primi messaggi dagli interessati</p>
        <div className="grid grid-cols-3 gap-3">
          {([
            { value: 'app', label: 'App rooMate', icon: MessageSquare, desc: 'Chat integrata' },
            { value: 'email', label: 'Email', icon: Mail, desc: 'Via email' },
            { value: 'phone', label: 'Telefono', icon: Phone, desc: 'Chiamata/WhatsApp' },
          ] as const).map(({ value, label, icon: Icon, desc }) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange({ contactPreference: value })}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                data.contactPreference === value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium text-sm">{label}</span>
              <span className="text-xs opacity-75">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
