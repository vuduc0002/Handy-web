/**
 * Chuyển đổi mọi định dạng link YouTube thành URL embed chuẩn.
 * Hỗ trợ: watch?v=ID, youtu.be/ID, youtube.com/shorts/ID, đã là embed.
 * Trả về URL gốc nếu không phải link YouTube.
 */
export function getEmbedYoutubeUrl(url: string): string {
  if (!url) return ''
  try {
    // Đã là embed → giữ nguyên, thêm autoplay nếu chưa có
    if (url.includes('youtube.com/embed/')) {
      return url.includes('?') ? `${url}&autoplay=1` : `${url}?autoplay=1`
    }

    // Lấy video ID từ các định dạng khác nhau
    let videoId: string | null = null

    // youtube.com/watch?v=ID hoặc youtube.com/watch?v=ID&list=...
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    if (watchMatch) {
      videoId = watchMatch[1]
    }

    // youtu.be/ID
    if (!videoId) {
      const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
      if (shortMatch) videoId = shortMatch[1]
    }

    // youtube.com/shorts/ID
    if (!videoId) {
      const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/)
      if (shortsMatch) videoId = shortsMatch[1]
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    }

    // Không phải YouTube → trả về nguyên gốc
    return url
  } catch {
    return url
  }
}
