import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X, ZoomIn } from 'lucide-react';
import logo from '@/assets/fitin-final-logo.jpg';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ProgressPhoto {
  id: string;
  imageUrl: string;
  weight?: number;
  description?: string;
  date: string;
}

const ProgressGallery = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [weight, setWeight] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
    loadPhotos();
  }, [navigate]);

  const loadPhotos = () => {
    const stored = localStorage.getItem('progressPhotos');
    if (stored) {
      setPhotos(JSON.parse(stored));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!uploadPreview) {
      toast.error('Please select a photo first');
      return;
    }

    setIsUploading(true);
    
    const newPhoto: ProgressPhoto = {
      id: Date.now().toString(),
      imageUrl: uploadPreview,
      weight: weight ? parseFloat(weight) : undefined,
      description: description || undefined,
      date: new Date().toISOString(),
    };

    const updatedPhotos = [newPhoto, ...photos];
    setPhotos(updatedPhotos);
    localStorage.setItem('progressPhotos', JSON.stringify(updatedPhotos));

    toast.success('Progress photo uploaded successfully!');
    
    // Reset form
    setUploadPreview(null);
    setWeight('');
    setDescription('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsUploading(false);
  };

  const handleDelete = (id: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(updatedPhotos);
    localStorage.setItem('progressPhotos', JSON.stringify(updatedPhotos));
    toast.success('Photo deleted');
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="FitIn" className="h-10 w-auto" />
              <h1 className="text-2xl font-bold">Progress Gallery</h1>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/premium')}
              className="text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Upload Progress Photo</h2>
            
            {/* File Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-primary/30 rounded-xl p-8 mb-4 cursor-pointer hover:border-primary/50 transition-colors bg-background/20"
            >
              {uploadPreview ? (
                <div className="relative">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUploadPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">Click to upload a photo</p>
                  <p className="text-sm text-muted-foreground mt-2">Max file size: 5MB</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {/* Weight Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Current Weight (kg)</label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter your current weight"
                className="bg-background/50"
              />
            </div>

            {/* Description Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Description (Optional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about your progress..."
                className="bg-background/50 min-h-[100px]"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={!uploadPreview || isUploading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Upload Photo
            </Button>
          </Card>
        </motion.div>

        {/* Progress Journey */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold mb-6">Your Progress Journey</h2>
          
          {photos.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <p className="text-muted-foreground text-lg">No progress photos yet</p>
              <p className="text-muted-foreground mt-2">Start your journey by uploading your first photo!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card overflow-hidden group">
                    <div className="relative aspect-square">
                      <img
                        src={photo.imageUrl}
                        alt={`Progress ${photo.date}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedImage(photo.imageUrl)}
                          className="bg-background/20 hover:bg-background/40"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(photo.id)}
                          className="bg-background/20 hover:bg-background/40"
                        >
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground">
                        {new Date(photo.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {photo.weight && (
                        <p className="text-lg font-semibold mt-1">{photo.weight} kg</p>
                      )}
                      {photo.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {photo.description}
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Image Zoom Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default ProgressGallery;
