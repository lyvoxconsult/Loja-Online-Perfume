import { useCallback, useState } from "react";
import { Upload, X, File, FileAudio, FileVideo, FileText, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string; // Base64 para storage local
}

interface FileUploaderProps {
  files: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string[];
}

const ALLOWED_TYPES = {
  pdf: ["application/pdf"],
  document: [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/x-m4a"],
  video: ["video/mp4", "video/webm", "video/ogg", "video/avi", "video/quicktime"],
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
};

const ALL_ALLOWED = Object.values(ALLOWED_TYPES).flat();

const getFileIcon = (type: string) => {
  if (ALLOWED_TYPES.audio.includes(type)) return FileAudio;
  if (ALLOWED_TYPES.video.includes(type)) return FileVideo;
  if (ALLOWED_TYPES.document.includes(type) || type === "text/plain") return FileText;
  if (ALLOWED_TYPES.pdf.includes(type)) return FileText;
  return File;
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const FileUploader = ({
  files,
  onFilesChange,
  maxFiles = 3,
  maxSizeMB = 2,
  accept = ALL_ALLOWED,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validateFile = useCallback((file: File): string | null => {
    if (!accept.includes(file.type) && !accept.some((t) => file.type.startsWith(t.replace("/*", "/")))) {
      return `Tipo de arquivo não permitido: ${file.name}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Arquivo muito grande: ${file.name} (máx: ${maxSizeMB}MB)`;
    }
    return null;
  }, [accept, maxSizeMB]);

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newFiles: UploadedFile[] = [];
      const newErrors: string[] = [];

      const filesArray = Array.from(fileList);

      if (filesArray.length + files.length > maxFiles) {
        toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
        return;
      }

      const totalBytes = [...files, ...filesArray].reduce((sum, file) => sum + file.size, 0);
      if (totalBytes > 4 * 1024 * 1024) {
        toast.error("O total de arquivos da demonstração não pode ultrapassar 4 MB.");
        return;
      }

      filesArray.forEach((file) => {
        const error = validateFile(file);
        if (error) {
          newErrors.push(error);
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          newFiles.push({
            id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl,
          });

          if (newFiles.length === filesArray.length - filesArray.filter((f) => validateFile(f)).length) {
            onFilesChange([...files, ...newFiles]);
          }
        };
        reader.readAsDataURL(file);
      });

      if (newErrors.length > 0) {
        setErrors(newErrors);
        setTimeout(() => setErrors([]), 5000);
      }
    },
    [files, maxFiles, onFilesChange, validateFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const getFileCategory = (type: string): string => {
    if (ALLOWED_TYPES.pdf.includes(type)) return "PDF";
    if (ALLOWED_TYPES.audio.includes(type)) return "Áudio";
    if (ALLOWED_TYPES.video.includes(type)) return "Vídeo";
    if (ALLOWED_TYPES.document.includes(type)) return "Documento";
    if (ALLOWED_TYPES.image.includes(type)) return "Imagem";
    return "Arquivo";
  };

  return (
    <div className="space-y-4">
      {/* Zona de Upload */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragging
            ? "border-accent bg-accent/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          files.length >= maxFiles && "opacity-50 pointer-events-none"
        )}
      >
        <input
          type="file"
          multiple
          accept={accept.join(",")}
          onChange={handleFileInput}
          className="hidden"
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input" className="cursor-pointer">
          <Upload className={cn("h-10 w-10 mx-auto mb-3", isDragging ? "text-accent" : "text-muted-foreground")} />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-primary">Clique para fazer upload</span> ou arraste arquivos aqui
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PDF, documentos, áudios, vídeos • Máx. {maxSizeMB}MB por arquivo • Até {maxFiles} arquivos
          </p>
        </label>
      </div>

      {/* Erros de Validação */}
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div className="space-y-1">
              {errors.map((error, i) => (
                <p key={i} className="text-sm text-destructive">{error}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Arquivos ({files.length}/{maxFiles})
            </span>
          </div>
          <div className="divide-y divide-border rounded-lg border">
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div key={file.id} className="flex items-center gap-3 p-3">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">{file.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{getFileCategory(file.type)}</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export type { UploadedFile };
