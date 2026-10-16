import { MessageSquareQuote } from 'lucide-react'

export default function TestimonialsSection() {
  return (
    <section className="my-16">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-xs font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Chia Sẻ Thực Tế
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
          Học Viên & Phụ Huynh Nói Gì Về Handy?
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Ghi nhận những trải nghiệm và ý kiến đóng góp từ cộng đồng học viên
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[0, 1, 2].map((idx) => (
          <div
            key={idx}
            className="w-full min-h-[190px] rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center p-6 text-center hover:border-gray-400 transition-colors"
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
              <MessageSquareQuote className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-500 max-w-xs">
              Khu vực hiển thị Đánh giá của Học viên
            </p>
            <p className="text-xs text-gray-400 italic mt-1">
              (Chờ Admin cập nhật)
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
