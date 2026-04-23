// file: app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) return NextResponse.json({ message: "Lỗi: Chưa có API Key." }, { status: 500 });

  try {
    // Nhận tình huống VÀ sản phẩm được chọn từ giao diện
    const body = await request.json();
    const { situation, productName, productLink } = body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); 
    
    // Yêu cầu AI đóng vai cô gái bán hàng Anime
    const prompt = `
      Bạn là một nữ nhân viên bán hàng thời trang (bán áo nữ) bạn hãy đưa ra gợi ý để gắn link sản phẩm bằng từ ngữ các nói theo trend , theo kiểu phong cách bài viết.
      Tình huống của khách hàng là: "${situation}".
      sản phẩm này để gợi ý: "${productName}" (Link: ${productLink}).
      hãy cho tôi 1 comment ngắn gọn(viết không xuống dòng) để thu hút họ với sản phẩm, và BẮT BUỘC chèn link sản phẩm vào câu trả lời nhé!
    `;

    const result = await model.generateContent(prompt);
    return NextResponse.json({ message: result.response.text() });

  } catch (error) {
    console.error("Lỗi AI:", error);
    return NextResponse.json({ message: 'Lỗi hệ thống AI.' }, { status: 500 });
  }
}