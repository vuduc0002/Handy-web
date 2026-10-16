import { Star, Quote } from 'lucide-react'

export default function TestimonialsSection() {
  const reviews = [
    {
      name: 'Chị Mai Lan',
      role: 'Phụ huynh bé Bắp (6 tuổi)',
      avatar: '👩‍👧',
      review:
        '[Ý kiến đánh giá 1-2 câu về sự tiện lợi, hào hứng khi học ngôn ngữ ký hiệu cùng HANDY: Con tôi rất thích các video sinh động của Handy, học rất nhanh và nhớ lâu!]',
      tag: 'Phụ huynh',
    },
    {
      name: 'Thầy Quốc Huy',
      role: 'Giáo viên Giáo dục Đặc biệt',
      avatar: '👨‍🏫',
      review:
        '[Ý kiến đánh giá 1-2 câu về sự tiện lợi, hào hứng khi học ngôn ngữ ký hiệu cùng HANDY: Giáo trình trực quan và cách tiếp cận theo chủ đề giúp học sinh tiếp thu một cách tự nhiên nhất.]',
      tag: 'Giáo viên',
    },
    {
      name: 'Bạn Minh Trí',
      role: 'Học viên tình nguyện viên',
      avatar: '🧑‍🎓',
      review:
        '[Ý kiến đánh giá 1-2 câu về sự tiện lợi, hào hứng khi học ngôn ngữ ký hiệu cùng HANDY: Ứng dụng rất tiện lợi để tra cứu cử chỉ bàn tay mọi lúc mọi nơi trên điện thoại!]',
      tag: 'Học viên',
    },
  ]

  return (
    <section className="my-16">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Chia Sẻ Thực Tế
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
          Học Viên & Phụ Huynh Nói Gì Về Handy?
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Niềm vui và sự tiến bộ của các bạn nhỏ chính là động lực lớn nhất của chúng tôi
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Sao đánh giá 5 sao */}
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Lời trích dẫn */}
              <p className="text-sm text-gray-600 leading-relaxed italic mb-6">
                "{item.review}"
              </p>
            </div>

            {/* Thông tin người đánh giá */}
            <div className="flex items-center gap-3 pt-4 border-t border-amber-100">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                {item.avatar}
              </div>
              <div className="min-w-0">
                <p className="font-extrabold text-gray-800 text-sm truncate">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {item.role}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
