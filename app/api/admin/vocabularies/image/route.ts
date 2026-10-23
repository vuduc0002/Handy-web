import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

const BUCKET_NAME = 'handy-images'

// Helper đảm bảo bucket handy-images tồn tại
async function ensureBucket() {
  try {
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const found = buckets?.some((b) => b.name === BUCKET_NAME)
    if (!found) {
      await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/*'],
      })
    }
  } catch (err) {
    console.error('[Storage] Lỗi khi kiểm tra/tạo bucket:', err)
  }
}

// ============================================================================
// POST: Tải ảnh lên bucket và cập nhật vào bảng vocabularies
// ============================================================================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const wordId = formData.get('wordId') as string | null
    const imageType = formData.get('imageType') as 'illustration' | 'gesture' | null
    let fileName = formData.get('fileName') as string | null

    if (!file || !wordId || !imageType) {
      return NextResponse.json(
        { error: 'Thiếu thông tin file, wordId hoặc imageType' },
        { status: 400 }
      )
    }

    if (!['illustration', 'gesture'].includes(imageType)) {
      return NextResponse.json(
        { error: 'imageType chỉ được phép là illustration hoặc gesture' },
        { status: 400 }
      )
    }

    await ensureBucket()

    // Định dạng tên file: word_[wordId]_[imageType]-[timestamp].jpg
    if (!fileName) {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      fileName = `word_${wordId}_${imageType}-${Date.now()}.${ext}`
    }

    // Đọc ArrayBuffer của file để upload lên Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('[Storage Upload Error]:', uploadError)
      return NextResponse.json(
        { error: `Lỗi khi đẩy ảnh lên Storage: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Lấy Public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    const publicUrl = urlData.publicUrl

    // Cập nhật vào DB
    const updateColumn =
      imageType === 'illustration' ? 'illustration_url' : 'gesture_image_url'

    const { error: dbError } = await supabaseAdmin
      .from('vocabularies')
      .update({ [updateColumn]: publicUrl })
      .eq('id', wordId)

    if (dbError) {
      console.error('[Database Update Error]:', dbError)
      return NextResponse.json(
        { error: `Lỗi khi lưu URL vào cơ sở dữ liệu: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      publicUrl,
      fileName,
    })
  } catch (err: unknown) {
    console.error('[API Upload Exception]:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lỗi không xác định khi tải ảnh' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE: Xóa ảnh vật lý trên bucket và set NULL trong bảng vocabularies
// ============================================================================
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { wordId, imageType, imageUrl } = body as {
      wordId?: string
      imageType?: 'illustration' | 'gesture'
      imageUrl?: string | null
    }

    if (!wordId || !imageType) {
      return NextResponse.json(
        { error: 'Thiếu thông tin wordId hoặc imageType' },
        { status: 400 }
      )
    }

    // 1. Xóa file vật lý trên bucket (nếu có URL)
    if (imageUrl) {
      try {
        const parts = imageUrl.split(`/${BUCKET_NAME}/`)
        const filePath = parts.length > 1 ? decodeURIComponent(parts[1]) : null
        if (filePath) {
          await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath])
        }
      } catch (removeErr) {
        console.warn('[Storage Remove Warning]:', removeErr)
      }
    }

    // 2. Cập nhật giá trị cột tương ứng trong bảng vocabularies thành NULL
    const updateColumn =
      imageType === 'illustration' ? 'illustration_url' : 'gesture_image_url'

    const { error: dbError } = await supabaseAdmin
      .from('vocabularies')
      .update({ [updateColumn]: null })
      .eq('id', wordId)

    if (dbError) {
      console.error('[Database Delete Error]:', dbError)
      return NextResponse.json(
        { error: `Lỗi khi gỡ ảnh trong cơ sở dữ liệu: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[API Delete Exception]:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lỗi không xác định khi xóa ảnh' },
      { status: 500 }
    )
  }
}
