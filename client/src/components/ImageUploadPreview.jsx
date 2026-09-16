import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, Video, X, Eye, Sparkles } from 'lucide-react';

export default function ImageUploadPreview({ 
  onImagesSelected, 
  onVideoSelected, 
  showYoloPreview = false,
  mockAiLabel = 'Damaged Pavement / Pothole',
  mockConfidence = 0.94
}) {
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    setError(null);
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Check size limit: 15MB per image
    const invalidFile = files.find(f => f.size > 15 * 1024 * 1024);
    if (invalidFile) {
      setError(`File "${invalidFile.name}" exceeds 15MB maximum limit.`);
      return;
    }

    const newImagePreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    const updated = [...images, ...newImagePreviews].slice(0, 5); // Max 5
    setImages(updated);
    if (onImagesSelected) {
      onImagesSelected(updated.map(i => i.file));
    }
  };

  const removeImage = (index) => {
    const itemToRemove = images[index];
    if (itemToRemove?.url) {
      URL.revokeObjectURL(itemToRemove.url);
    }
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    if (onImagesSelected) {
      onImagesSelected(updated.map(i => i.file));
    }
  };

  const handleVideoChange = (e) => {
    setError(null);
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 50MB
    if (file.size > 50 * 1024 * 1024) {
      setError(`Video file "${file.name}" exceeds 50MB limit.`);
      return;
    }

    const videoObj = {
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      sizeMb: (file.size / (1024 * 1024)).toFixed(1)
    };

    setVideo(videoObj);
    if (onVideoSelected) {
      onVideoSelected(file);
    }
  };

  const removeVideo = () => {
    if (video?.url) {
      URL.revokeObjectURL(video.url);
    }
    setVideo(null);
    if (onVideoSelected) {
      onVideoSelected(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Grid of upload cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Image Upload Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <ImageIcon className="w-3.5 h-3.5 text-railway-600" />
              <span>Upload Photos (Max 5)</span>
            </label>
            <span className="text-[11px] text-slate-400">JPG, PNG, WEBP (Max 15MB)</span>
          </div>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-railway-500 rounded-lg p-4 cursor-pointer bg-white hover:bg-railway-50/30 transition-all text-center group">
            <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-railway-600 mb-1 transition-colors" />
            <span className="text-xs font-medium text-slate-700">
              Click to select photos or drag & drop
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              YOLO AI auto-detects potholes, damage, garbage & fixtures
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {showYoloPreview && idx === 0 && (
                    <div className="absolute inset-0 border-2 border-emerald-500 bg-emerald-500/10 pointer-events-none flex items-start justify-start p-1">
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        YOLO: {mockAiLabel} ({Math.round(mockConfidence * 100)}%)
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center transition-colors shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Video Upload Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-railway-600" />
              <span>Upload Video (Optional)</span>
            </label>
            <span className="text-[11px] text-slate-400">MP4, WEBM, MOV (Max 50MB)</span>
          </div>

          {!video ? (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-railway-500 rounded-lg p-4 cursor-pointer bg-white hover:bg-railway-50/30 transition-all text-center group">
              <Video className="w-6 h-6 text-slate-400 group-hover:text-railway-600 mb-1 transition-colors" />
              <span className="text-xs font-medium text-slate-700">
                Click to attach a site video recording
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                Helps railway engineers inspect dynamic or large hazards
              </span>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 truncate max-w-[200px]">
                  {video.name}
                </span>
                <span className="text-slate-400 text-[11px]">{video.sizeMb} MB</span>
              </div>
              <video
                src={video.url}
                className="w-full max-h-32 rounded bg-black object-contain"
                controls
              />
              <button
                type="button"
                onClick={removeVideo}
                className="w-full flex items-center justify-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium pt-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove Video</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
