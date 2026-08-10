"use client";

import { useState } from "react";
import { ProductDetailData } from "@/types/product-detail";

interface ProductTabsProps {
  product: ProductDetailData;
}

export const ProductTabs = ({ product }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<"description" | "specifications">("description");

  const highlights = [
    {
      title: "100% Nguyên Liệu Tươi Chuẩn Vệ Sinh",
      desc: "Không sử dụng hàng đông lạnh lâu ngày, đảm bảo hương vị nguyên bản và an toàn tuyệt đối.",
    },
    {
      title: "Chế Biến Chuẩn Công Thức Độc Quyền",
      desc: "Nướng than hoa mọng nước, gia vị thấm đượm từng thớ thịt.",
    },
    {
      title: "Nước Sốt Đậm Đà Đặc Trưng",
      desc: "Ninh lửa nhỏ nhiều giờ với các loại gia vị chọn lọc khắt khe.",
    },
    {
      title: "Đóng Gói Giữ Nhiệt Siêu Tốc",
      desc: "Bao bì chuyên dụng giữ món ăn luôn nóng hổi khi giao tới tay coder.",
    },
  ];

  const specifications = [
    { label: "Danh mục", value: product.category.name },
    { label: "Trạng thái tồn kho", value: product.stock > 0 ? "Còn hàng" : "Hết hàng" },
    { label: "Bảo quản", value: "Dùng ngay trong vòng 2 giờ sau khi nhận" },
    { label: "Phù hợp", value: "Cú đêm chạy deadline, cày game, tiệc nhẹ văn phòng" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-16">
      {/* Tab Nav Headers */}
      <div className="flex border-b border-slate-200 flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("description")}
          className={`px-6 sm:px-8 py-4 font-bold text-sm sm:text-base transition-all border-b-2 ${
            activeTab === "description"
              ? "text-orange-600 border-orange-600 bg-orange-50/50"
              : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          Mô tả chi tiết
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("specifications")}
          className={`px-6 sm:px-8 py-4 font-bold text-sm sm:text-base transition-all border-b-2 ${
            activeTab === "specifications"
              ? "text-orange-600 border-orange-600 bg-orange-50/50"
              : "text-slate-500 border-transparent hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          Thông số & Thành phần
        </button>
      </div>

      {/* Tab Body */}
      <div className="p-6 sm:p-8">
        {activeTab === "description" ? (
          <div className="max-w-4xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900 leading-snug">
              Đỉnh cao ẩm thực đêm - Tiếp năng lượng vượt deadline
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              {product.description ||
                "Không chỉ là món ăn nhanh đơn thuần, sản phẩm của TechBite là sự kết hợp hoàn hảo giữa nguyên liệu thượng hạng và kỹ thuật chế biến tỉ mỉ. Đảm bảo mang tới cho bạn trải nghiệm tuyệt vời nhất."}
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-orange-50/60 p-5 sm:p-6 rounded-xl border border-orange-100">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Thông tin chi tiết & Quy chuẩn bảo quản
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
              {specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-3 p-3.5 sm:px-5 sm:py-4 text-sm"
                >
                  <span className="font-semibold text-slate-500">
                    {spec.label}
                  </span>
                  <span className="sm:col-span-2 font-medium text-slate-900 mt-0.5 sm:mt-0">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
