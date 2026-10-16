import { HelpCircle } from 'lucide-react'

export default function FAQSection() {
  return (
    <section className="my-16 max-w-4xl mx-auto px-2">
      <div className="text-center mb-8">
        <span className="text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-100 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Hỗ Trợ 24/7
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-800">
          Câu Hỏi Thường Gặp (FAQ)
        </h2>
        <p className="text-sm text-gray-500 mt-2">
          Giải đáp các thắc mắc phổ biến nhất khi học tập cùng Handy
        </p>
      </div>

      {/* 1 Khối Placeholder lớn cho toàn bộ danh sách FAQ */}
      <div className="w-full min-h-[200px] rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center p-8 text-center hover:border-gray-400 transition-colors">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
          <HelpCircle className="w-7 h-7" />
        </div>
        <p className="text-base font-bold text-gray-500">
          Khu vực hiển thị Danh sách câu hỏi FAQ
        </p>
        <p className="text-xs text-gray-400 italic mt-1.5">
          (Chờ Admin cập nhật)
        </p>
      </div>
    </section>
  )
}
