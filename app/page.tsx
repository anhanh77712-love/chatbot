// file: app/page.tsx
'use client';

import { useState, useEffect } from 'react';

type Product = { id: number; name: string; link: string };

export default function Home() {
  const [activeTab, setActiveTab] = useState<'products' | 'chat'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  
  // State cho Tab Sản Phẩm
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  // State cho Tab Chat
  const [situation, setSituation] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  
  // THÊM MỚI: State để theo dõi việc sao chép
  const [isCopied, setIsCopied] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch(`/api/products?search=${searchTerm}`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, [searchTerm]);

  const handleAddOrEdit = async () => {
    if (!newName || !newLink) return alert('Vui lòng nhập đủ tên và link áo nha! 🌸');
    
    if (editingId) {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: newName, link: newLink })
      });
      setEditingId(null);
    } else {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, link: newLink })
      });
    }
    setNewName(''); setNewLink(''); fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Cậu có chắc muốn xóa sản phẩm này không? 🥺')) {
      await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      fetchProducts();
    }
  };

  const handleEditClick = (p: Product) => {
    setEditingId(p.id); setNewName(p.name); setNewLink(p.link);
  };

  const handleChat = async () => {
    if (!situation || !selectedProductId) return alert('Nhập tình huống và chọn áo để tư vấn nha! ✨');
    
    setIsChatting(true);
    setChatResponse('Đang suy nghĩ câu trả lời siêu dễ thương... 🎀');
    setIsCopied(false); // Reset lại trạng thái copy
    
    const selectedProd = products.find(p => p.id === Number(selectedProductId));

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          situation, 
          productName: selectedProd?.name, 
          productLink: selectedProd?.link 
        }),
      });
      const data = await res.json();
      setChatResponse(data.message);
    } catch (e) {
      setChatResponse('Ôi hỏng rồi, có lỗi xảy ra! 😭');
    } finally {
      setIsChatting(false);
    }
  };

  // THÊM MỚI: Hàm xử lý sự kiện bấm nút Copy
  const handleCopy = () => {
    // Lệnh copy text vào bộ nhớ tạm
    navigator.clipboard.writeText(chatResponse);
    setIsCopied(true); // Đổi trạng thái thành đã copy (hiện dấu tích xanh)
    
    // Sau 2 giây thì đổi lại thành biểu tượng clipboard
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '"Comic Sans MS", "Nunito", sans-serif', backgroundColor: '#fff0f5', color: '#4a4a4a' }}>
      
      {/* SIDEBAR BÊN TRÁI */}
      <div style={{ width: '250px', backgroundColor: '#ffb6c1', padding: '20px', boxShadow: '2px 0 10px rgba(255,105,180,0.2)' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', textShadow: '1px 1px 2px #ff69b4' }}>🌸 Tủ Đồ Anime 🌸</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '40px' }}>
          <button 
            onClick={() => setActiveTab('products')}
            style={{ padding: '12px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: activeTab === 'products' ? '#fff' : 'transparent', color: activeTab === 'products' ? '#ff69b4' : '#fff', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }}
          >
            👗 Quản Lý Áo Nữ
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            style={{ padding: '12px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: activeTab === 'chat' ? '#fff' : 'transparent', color: activeTab === 'chat' ? '#ff69b4' : '#fff', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' }}
          >
            ✨ Đề Xuất Gợi Ý
          </button>
        </div>
      </div>

      {/* NỘI DUNG BÊN PHẢI */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* TAB 1: SẢN PHẨM */}
        {activeTab === 'products' && (
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(255,182,193,0.3)' }}>
            <h2 style={{ color: '#ff69b4', borderBottom: '2px dashed #ffb6c1', paddingBottom: '10px' }}>🎀 Quản Lý Danh Sách Áo</h2>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Tên áo (VD: Áo trễ vai màu hồng)..." style={inputStyle} />
              <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="Link sản phẩm..." style={inputStyle} />
              <button onClick={handleAddOrEdit} style={buttonStyle}>{editingId ? '💾 Lưu Lại' : '💖 Thêm Mới'}</button>
            </div>

            <input 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              placeholder="🔍 Tìm kiếm áo nè..." 
              style={{...inputStyle, width: '100%', marginBottom: '20px', background: '#fff0f5'}} 
            />

            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#ffb6c1', color: '#fff' }}>
                  <th style={thStyle}>Tên Áo</th>
                  <th style={thStyle}>Đường Link</th>
                  <th style={thStyle}>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #ffe4e1' }}>
                    <td style={tdStyle}>{p.name}</td>
                    <td style={tdStyle}><a href={p.link} target="_blank" style={{ color: '#ff69b4' }}>Xem Link</a></td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEditClick(p)} style={actionBtnStyle}>✏️ Sửa</button>
                      <button onClick={() => handleDelete(p.id)} style={{...actionBtnStyle, color: 'red'}}>❌ Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: ĐỀ XUẤT */}
        {activeTab === 'chat' && (
          <div style={{ background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(255,182,193,0.3)', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ color: '#ff69b4', textAlign: 'center', marginBottom: '20px' }}>💌 AI Tư Vấn Bán Hàng</h2>
            
            <p style={{ fontWeight: 'bold', color: '#ff69b4' }}>Tình huống khách hàng:</p>
            <textarea 
              value={situation} 
              onChange={e => setSituation(e.target.value)} 
              rows={3} 
              placeholder="VD: Khách nữ 20 tuổi, muốn tìm áo đi biển..." 
              style={{...inputStyle, width: '100%', marginBottom: '15px'}} 
            />

            <p style={{ fontWeight: 'bold', color: '#ff69b4' }}>Chọn áo để gợi ý:</p>
            <select 
              value={selectedProductId} 
              onChange={e => setSelectedProductId(e.target.value)} 
              style={{...inputStyle, width: '100%', marginBottom: '20px', cursor: 'pointer'}}
            >
              <option value="">-- Click để chọn 1 mẫu áo từ Tủ Đồ nha --</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>

            <button 
              onClick={handleChat} 
              disabled={isChatting}
              style={{...buttonStyle, width: '100%', padding: '15px', fontSize: '18px'}}
            >
              {isChatting ? 'Đang viết lời nhắn... 🌸' : '✨ Tư Vấn Xong, Trả Kết Quả ✨'}
            </button>

            {chatResponse && (
              // CẬP NHẬT: Thêm position 'relative' để đặt nút Copy vào góc
              <div style={{ position: 'relative', marginTop: '30px', background: '#fff0f5', padding: '20px', borderRadius: '15px', border: '2px dashed #ffb6c1', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                
                {/* THÊM MỚI: Nút Copy */}
                <button 
                  onClick={handleCopy}
                  title="Sao chép câu trả lời"
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '20px',
                    padding: '5px',
                  }}
                >
                  {isCopied ? '✅' : '📋'}
                </button>

                {chatResponse}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '10px', border: '1px solid #ffb6c1', outline: 'none', fontSize: '15px' };
const buttonStyle = { background: '#ff69b4', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' };
const thStyle = { padding: '12px', borderBottom: '2px solid #fff' };
const tdStyle = { padding: '12px' };
const actionBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', marginRight: '10px' };