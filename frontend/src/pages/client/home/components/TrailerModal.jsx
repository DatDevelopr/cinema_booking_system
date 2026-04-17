// TrailerModal.jsx
import { useEffect, useState } from "react";
import { X, Youtube, Clock, Calendar } from "lucide-react";

export default function TrailerModal({ movie, onClose }) {
  const [videoId, setVideoId] = useState(null);

  useEffect(() => {
    // Extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
      if (!url) return null;
      
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
        /youtu\.be\/([^&\n?#]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
    };

    const id = extractYouTubeId(movie.trailer_url);
    setVideoId(id);
  }, [movie.trailer_url]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` : null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl mx-4 bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
              <Youtube size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                Trailer: {movie.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{movie.duration} phút</span>
                </div>
                {movie.release_date && (
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    <span>{new Date(movie.release_date).toLocaleDateString("vi-VN")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>
        
        {/* Video Player */}
        <div className="relative bg-black">
          {embedUrl ? (
            <div className="aspect-video w-full">
              <iframe
                src={embedUrl}
                title={`Trailer phim ${movie.title}`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center mb-4">
                <Youtube size={40} className="text-red-500" />
              </div>
              <p className="text-gray-400 text-center mb-2">
                Không thể tải video trailer
              </p>
              <p className="text-gray-500 text-sm text-center max-w-md">
                {movie.trailer_url || "Chưa có trailer cho phim này"}
              </p>
              {movie.trailer_url && (
                <a
                  href={movie.trailer_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Youtube size={18} />
                  Xem trên YouTube
                </a>
              )}
            </div>
          )}
        </div>
        
        {/* Movie Info Footer */}
        <div className="p-4 bg-gradient-to-r from-gray-900 to-black border-t border-gray-800">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-gray-300">{movie.title}</p>
              {movie.director && (
                <p className="text-xs text-gray-500">Đạo diễn: {movie.director}</p>
              )}
            </div>
            <button
              onClick={() => {
                onClose();
                // Navigate to movie detail
                window.location.href = `/movies/${movie.movie_id}`;
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}