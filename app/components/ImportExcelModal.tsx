'use client'

import { useState, useRef } from 'react'
import * as XLSX from 'xlsx'
import {
  FileSpreadsheet,
  Download,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { getEmbedYoutubeUrl } from '@/lib/utils'

interface ImportExcelModalProps {
  isOpen: boolean
  onClose: () => void
  topicId?: string
  topicTitle?: string
  topics?: { id: string; title: string }[]
  onSuccess?: (count: number) => void
  showToast?: (message: string, type?: 'success' | 'error') => void
}

interface ParsedWordItem {
  word: string
  video_url: string | null
  meaning?: string
}

export default function ImportExcelModal({
  isOpen,
  onClose,
  topicId,
  topicTitle,
  topics = [],
  onSuccess,
  showToast,
}: ImportExcelModalProps) {
  const [selectedTopicId, setSelectedTopicId] = useState<string>(
    topicId || (topics.length > 0 ? topics[0].id : '')
  )
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedItems, setParsedItems] = useState<ParsedWordItem[]>([])
  const [isParsing, setIsParsing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  // 1. Tải file Excel mẫu (Template) với Header chuẩn Cột A: Từ vựng, Cột B: Link YouTube
  const handleDownloadTemplate = () => {
    try {
      const wsData = [
        ['Từ vựng', 'Link YouTube'],
        ['Xin chào', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
        ['Cảm ơn', 'https://www.youtube.com/watch?v=example'],
        ['Tạm biệt', ''],
      ]

      const ws = XLSX.utils.aoa_to_sheet(wsData)
      ws['!cols'] = [{ wch: 25 }, { wch: 55 }]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Mau_Import')
      XLSX.writeFile(wb, 'Mau_Import_Tu_Vung_Handy.xlsx')

      showToast?.('Đã tải xuống file Excel mẫu thành công!', 'success')
    } catch (err: unknown) {
      console.error('Lỗi tải file mẫu:', err)
      showToast?.('Không thể tạo file mẫu', 'error')
    }
  }

  // 2. Đọc và phân tích file Excel (.xlsx, .xls, .csv)
  const processFile = (file: File) => {
    setErrorMsg(null)
    setSelectedFile(file)
    setIsParsing(true)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' })

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          throw new Error('File Excel không có sheet dữ liệu nào.')
        }

        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]

        // Parse theo dạng mảng 2 chiều (Header = 1)
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 })

        if (!rows || rows.length <= 1) {
          throw new Error('File Excel trống hoặc chỉ có dòng tiêu đề.')
        }

        // Bỏ qua dòng Header (index 0)
        const dataRows = rows.slice(1)
        const validItems: ParsedWordItem[] = []

        for (const row of dataRows) {
          if (!row || row.length === 0) continue

          const rawWord = row[0] !== undefined && row[0] !== null ? String(row[0]).trim() : ''
          if (!rawWord) continue // Bỏ qua nếu từ vựng rỗng

          const rawVideoUrl =
            row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== ''
              ? String(row[1]).trim()
              : null

          validItems.push({
            word: rawWord,
            video_url: rawVideoUrl ? getEmbedYoutubeUrl(rawVideoUrl) : null,
            meaning: rawWord, // Mặc định nghĩa bằng từ vựng nếu không cung cấp thêm
          })
        }

        if (validItems.length === 0) {
          throw new Error(
            'Không tìm thấy dữ liệu từ vựng hợp lệ ở Cột A. Vui lòng kiểm tra lại file.'
          )
        }

        setParsedItems(validItems)
      } catch (err: unknown) {
        console.error('Lỗi khi đọc file Excel:', err)
        const msg = err instanceof Error ? err.message : 'File Excel không đúng định dạng.'
        setErrorMsg(msg)
        setParsedItems([])
        showToast?.(msg, 'error')
      } finally {
        setIsParsing(false)
      }
    }

    reader.onerror = () => {
      setIsParsing(false)
      const msg = 'Lỗi khi đọc tệp từ thiết bị của bạn.'
      setErrorMsg(msg)
      showToast?.(msg, 'error')
    }

    reader.readAsArrayBuffer(file)
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isImporting) setIsDragging(true)
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isImporting) setIsDragging(true)
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

    if (isImporting) return
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
    e.target.value = ''
  }

  // 3. Tiến hành Batch Insert vào Supabase
  const handleStartImport = async () => {
    const finalTopicId = topicId || selectedTopicId

    if (!finalTopicId) {
      const msg = 'Vui lòng chọn chủ đề để gắn từ vựng vào!'
      setErrorMsg(msg)
      showToast?.(msg, 'error')
      return
    }

    if (parsedItems.length === 0) {
      const msg = 'Chưa có từ vựng nào được nhận diện để import.'
      setErrorMsg(msg)
      showToast?.(msg, 'error')
      return
    }

    setIsImporting(true)
    setErrorMsg(null)

    try {
      // Chuẩn bị mảng dữ liệu với topic_id tự động gắn
      const payload = parsedItems.map((item) => ({
        topic_id: finalTopicId,
        word: item.word,
        meaning: item.meaning || item.word,
        video_url: item.video_url || '',
        is_deleted: false,
      }))

      // Thực hiện chèn dữ liệu theo từng batch 50 records
      const BATCH_SIZE = 50
      let totalInserted = 0

      for (let i = 0; i < payload.length; i += BATCH_SIZE) {
        const batch = payload.slice(i, i + BATCH_SIZE)
        const { data, error } = await supabase.from('vocabularies').insert(batch).select('id')

        if (error) {
          throw new Error(`Lỗi cơ sở dữ liệu: ${error.message}`)
        }

        totalInserted += data ? data.length : batch.length
      }

      showToast?.(`Đã import thành công ${totalInserted} từ vựng!`, 'success')

      if (onSuccess) {
        onSuccess(totalInserted)
      }

      // Đóng modal sau khi hoàn tất
      onClose()
    } catch (err: unknown) {
      console.error('Lỗi khi import batch vào DB:', err)
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi lưu vào Database'
      setErrorMsg(msg)
      showToast?.(msg, 'error')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-xl border border-gray-200 p-6 shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng Modal */}
        <button
          type="button"
          onClick={onClose}
          disabled={isImporting}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center absolute top-5 right-5 transition cursor-pointer disabled:opacity-40"
          title="Đóng cửa sổ"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100 pr-10">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              Import Từ Vựng Bằng Excel
            </h3>
            <p className="text-xs text-gray-500">
              {topicTitle
                ? `Thêm dữ liệu hàng loạt vào chủ đề: "${topicTitle}"`
                : 'Thêm dữ liệu từ vựng hàng loạt từ file .xlsx hoặc .csv'}
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="space-y-4">
          {/* Lựa chọn Chủ Đề (Nếu không có topicId cố định) */}
          {!topicId && topics.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Chủ đề đích cần import *
              </label>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                disabled={isImporting}
                className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nút Tải file mẫu */}
          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-gray-800 block">
                Chưa có file theo định dạng chuẩn?
              </span>
              <span className="text-[11px] text-gray-500 block mt-0.5">
                Cột A: <strong>Từ vựng</strong> | Cột B: <strong>Link YouTube</strong>
              </span>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isImporting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800 border border-emerald-300 text-xs font-semibold shadow-xs transition cursor-pointer shrink-0 disabled:opacity-40"
              title="Tải file mẫu Excel"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file mẫu</span>
            </button>
          </div>

          {/* Vùng Kéo / Thả hoặc Chọn file */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Chọn hoặc kéo thả file Excel tải lên (.xlsx, .xls, .csv) *
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              className="hidden"
              onChange={handleFileInputChange}
              disabled={isImporting}
            />

            <div
              onClick={() => {
                if (!isImporting) fileInputRef.current?.click()
              }}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-600 bg-emerald-50/70 text-emerald-800 scale-101'
                  : selectedFile
                  ? 'border-emerald-400 bg-emerald-50/30 text-gray-800'
                  : 'border-gray-300 hover:border-gray-500 bg-gray-50/70 hover:bg-gray-100/70 text-gray-500'
              }`}
            >
              <Upload className="w-7 h-7 mb-2 text-gray-400" />
              <p className="text-xs font-bold text-gray-800">
                {selectedFile ? selectedFile.name : 'Nhấp để chọn file hoặc kéo thả file vào đây'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : 'Hỗ trợ định dạng .xlsx, .xls, .csv'}
              </p>
            </div>
          </div>

          {/* Thông tin nhận diện & Trạng thái lỗi */}
          {isParsing && (
            <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
              <Loader2 className="w-4 h-4 animate-spin text-gray-700" />
              <span>Đang đọc và phân tích file Excel...</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {!isParsing && parsedItems.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Đã nhận diện thành công <strong>{parsedItems.length}</strong> từ vựng sẵn sàng
                  import.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 text-xs font-semibold transition cursor-pointer disabled:opacity-40"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleStartImport}
            disabled={isImporting || parsedItems.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Import...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Bắt đầu Import ({parsedItems.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
