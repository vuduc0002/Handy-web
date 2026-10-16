import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-amber-200 mt-auto py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo & Copyright */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Link href="/" className="shrink-0">
            <Image
              src="/handy-logo.png"
              alt="HANDY"
              width={100}
              height={40}
              className="object-contain"
              style={{ height: 'auto' }}
            />
          </Link>
          <span className="text-xs md:text-sm text-gray-500 font-medium">
            [Điền thông tin bản quyền/Copyright của doanh nghiệp]
          </span>
        </div>

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs md:text-sm text-gray-600 font-semibold">
          <Link href="#" className="hover:text-orange-500 transition">
            [Các liên kết: Điều khoản, Liên hệ, Chính sách bảo mật]
          </Link>
        </div>
      </div>
    </footer>
  )
}
