import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "VietQR-Code.png";

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Thắt cờ: Thiếu tham số URL hình ảnh" },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(imageUrl);
    if (!res.ok) {
      return NextResponse.json(
        { error: "Không thể lấy ảnh QR từ server nguồn" },
        { status: 500 }
      );
    }

    const imageBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/png";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Lỗi tải xuống ảnh QR Code" },
      { status: 500 }
    );
  }
}
