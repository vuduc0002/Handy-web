'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Loader2, Image as ImageIcon, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

interface ImageDropzoneProps {
  wordId: string
  imageType: 'illustration' | 'gesture'
  currentUrl?: string | null
  onUploadSuccess?: (url: string | null) => void
  label?: string
  className?: string
}

const BUCKET_NAME = 'handy-images'

export default function ImageDropzone({
  wordId,
  imageType,
  currentUrl = null,
  onUploadSuccess,
  label,
  className = '',
}: ImageDropzoneProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentUrl ?? null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Đồng bộ prop currentUrl khi parent data thay đổi
  useEffect(() => {
    setImageUrl(currentUrl ?? null)
  }, [currentUrl])

  // Xử lý upload file
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ chọn tệp hình ảnh (PNG, JPG, JPEG, WEBP, GIF)')
      return
    }

    setIsLoading(true)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const fileName = `word_${wordId}_${imageType}-${Date.now()}.${ext}`

      let finalPublicUrl: string | null = null

      // Cách 1: Thử tải trực tiếp bằng Supabase Client
      const { error: clientUploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
          contentType: file.type || 'image/jpeg',
          cacheControl: '3600',
          upsert: true,
        })

      if (!clientUploadError) {
        const { data: urlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName)
        finalPublicUrl = urlData.publicUrl

        const updateColumn =
          imageType === 'illustration' ? 'illustration_url' : 'gesture_image_url'

        const { error: dbError } = await supabase
          .from('vocabularies')
          .update({ [updateColumn]: finalPublicUrl })
          .eq('id', wordId)

        if (dbError) throw dbError
      } else {
        // Cách 2: Fallback qua API Server (bypass RLS storage)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('wordId', wordId)
        formData.append('imageType', imageType)
        formData.append('fileName', fileName)

        const res = await fetch('/api/admin/vocabularies/image', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Lỗi khi tải ảnh lên máy chủ')
        }
        finalPublicUrl = data.publicUrl
      }

      setImageUrl(finalPublicUrl)
      if (onUploadSuccess) {
        onUploadSuccess(finalPublicUrl)
      }
    } catch (err: unknown) {
      console.error('Lỗi upload ảnh:', err)
      alert(err instanceof Error ? err.message : 'Lỗi khi tải ảnh lên')
    } finally {
      setIsLoading(false)
      setIsDragging(false)
    }
  }

  // Xử lý xóa ảnh
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!imageUrl || isLoading) return

    const typeText = imageType === 'illustration' ? 'minh họa' : 'cử chỉ'
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa ảnh ${typeText} này không?`
    )
    if (!confirmed) return

    setIsLoading(true)

    try {
      // 1. Lấy đường dẫn file vật lý trên Storage
      const parts = imageUrl.split(`/${BUCKET_NAME}/`)
      const filePath = parts.length > 1 ? decodeURIComponent(parts[1]) : null

      if (filePath) {
        await supabase.storage.from(BUCKET_NAME).remove([filePath])
      }

      // 2. Cập nhật DB cột tương ứng = NULL
      const updateColumn =
        imageType === 'illustration' ? 'illustration_url' : 'gesture_image_url'

      const { error: dbError } = await supabase
        .from('vocabularies')
        .update({ [updateColumn]: null })
        .eq('id', wordId)

      if (dbError) {
        // Fallback qua API nếu client bị giới hạn quyền
        await fetch('/api/admin/vocabularies/image', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wordId, imageType, imageUrl }),
        })
      }

      setImageUrl(null)
      if (onUploadSuccess) {
        onUploadSuccess(null)
      }
    } catch (err: unknown) {
      console.error('Lỗi khi xóa ảnh:', err)
      alert(err instanceof Error ? err.message : 'Lỗi khi xóa ảnh')
    } finally {
      setIsLoading(false)
    }
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoading) setIsDragging(true)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isLoading) setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (isLoading) return
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleUpload(droppedFile)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleUpload(selectedFile)
    }
    e.target.value = ''
  }

  const openFilePicker = () => {
    if (!isLoading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <>
      <div
        className={`relative group inline-block select-none ${className}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />

        {/* Trạng thái 1: Đang có ảnh (Hiển thị thumbnail) */}
        {imageUrl ? (
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 shadow-2xs group/thumb">
            {/* Ảnh thu nhỏ */}
            <img
              src={imageUrl}
              alt={label || imageType}
              className="w-full h-full object-cover"
              loading="lazy"
            />

            {/* Lớp phủ hành động khi hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowPreviewModal(true)
                }}
                className="w-6 h-6 rounded bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-xs transition cursor-pointer"
                title="Xem ảnh phóng to"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={openFilePicker}
                className="w-6 h-6 rounded bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center shadow-xs transition cursor-pointer"
                title="Thay đổi ảnh khác"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Nút X xóa ảnh (góc trên bên phải) */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={isLoading}
              className="absolute -top-1 -right-1 w-5 h-5 bg-rose-600 hover:bg-rose-700 text-white rounded-full flex items-center justify-center shadow-xs transition active:scale-90 cursor-pointer z-10"
              title="Xóa ảnh này"
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          /* Trạng thái 2: Chưa có ảnh (Khung nét đứt kéo thả) */
          <div
            onClick={openFilePicker}
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-1 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 scale-102'
                : 'border-gray-300 hover:border-gray-500 bg-gray-50/80 hover:bg-gray-100/80 text-gray-400 hover:text-gray-600'
            }`}
            title="Nhấp hoặc kéo thả file ảnh vào đây"
          >
            <Upload className={`w-4 h-4 mb-0.5 ${isDragging ? 'text-indigo-600' : 'text-gray-400'}`} />
            <span className="text-[9px] font-medium leading-tight line-clamp-2">
              Kéo thả ảnh
            </span>
          </div>
        )}

        {/* Trạng thái đang tải (Loading Spinner) */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-white/80 rounded-lg flex flex-col items-center justify-center">
            <Loader2 className="w-5 h-5 text-gray-900 animate-spin" />
            <span className="text-[8px] font-bold text-gray-600 mt-1 uppercase tracking-tight">
              Đang lưu...
            </span>
          </div>
        )}
      </div>

      {/* Modal xem trước ảnh phóng to */}
      {showPreviewModal && imageUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setShowPreviewModal(false)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full p-4 relative shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-700" />
                <span className="text-xs font-bold text-gray-900">
                  {imageType === 'illustration' ? 'Ảnh Minh Họa' : 'Ảnh Cử Chỉ Thủ Ngữ'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center max-h-[70vh]">
              <img
                src={imageUrl}
                alt="Preview"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono text-[11px] truncate max-w-[280px]">
                {imageUrl}
              </span>
              <button
                type="button"
                onClick={openFilePicker}
                className="px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs cursor-pointer"
              >
                Đổi ảnh khác
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
