// file: app/page.tsx
'use client';

import { useState, useEffect } from 'react';

type Product = { id: number; name: string; link: string; is_visible: boolean };

export default function Home() {
  const [activeTab, setActiveTab] = useState<'products' | 'chat' | 'aivip'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [newName, setNewName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [situation, setSituation] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [vipSituation, setVipSituation] = useState('');
  const [vipResponse, setVipResponse] = useState('');
  const [isVipChatting, setIsVipChatting] = useState(false);
  const [isVipCopied, setIsVipCopied] = useState(false);

  const fetchProducts = async () => {
    const res = await fetch(`/api/products?search=${searchTerm}`);
    const data = await res.json();
    setProducts(data);
  };
  useEffect(() => { fetchProducts(); }, [searchTerm]);

  const handleAddOrEdit = async () => {
    if (!newName || !newLink) return alert('Vui lòng nhập đủ tên và link áo nha! 🌸');
    if (editingProduct) {
      await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingProduct.id, name: newName, link: newLink, is_visible: editingProduct.is_visible }) });
      setEditingProduct(null);
    } else {
      await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newName, link: newLink }) });
    }
    setNewName(''); setNewLink(''); fetchProducts();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Cậu có chắc muốn xóa sản phẩm này không? 🥺')) {
      await fetch('/api/products', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchProducts();
    }
  };

  // THÊM: Hàm Đổi trạng thái Ẩn/Hiện
  const handleToggleVisibility = async (p: Product) => {
    await fetch('/api/products', { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ id: p.id, name: p.name, link: p.link, is_visible: !p.is_visible }) 
    });
    fetchProducts();
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p); setNewName(p.name); setNewLink(p.link);
  };

  const handleChat = async () => {
    if (!situation || !selectedProductId) return alert('Nhập tình huống và chọn áo để tư vấn nha! ✨');
    setIsChatting(true); setChatResponse('Đang suy nghĩ câu trả lời siêu dễ thương... 🎀'); setIsCopied(false);
    const selectedProd = products.find(p => p.id === Number(selectedProductId));
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ situation, productName: selectedProd?.name, productLink: selectedProd?.link }) });
      const data = await res.json(); setChatResponse(data.message);
    } catch (e) { setChatResponse('Ôi hỏng rồi, có lỗi xảy ra! 😭'); } finally { setIsChatting(false); }
  };
  
  const handleCopy = () => { navigator.clipboard.writeText(chatResponse); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000); };
  const handleResetChat = () => { setSituation(''); setSelectedProductId(''); setChatResponse(''); setIsCopied(false); };

  const handleVipChat = async () => {
    if (!vipSituation) return alert('Hãy nhập tình huống để AI quét tủ đồ nha! ✨');
    setIsVipChatting(true); setVipResponse('AI VIP đang dùng siêu năng lực quét toàn bộ tủ đồ để chọn áo... 🪄✨'); setIsVipCopied(false);
    try {
      const res = await fetch('/api/aivip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ situation: vipSituation }) });
      const data = await res.json(); setVipResponse(data.message);
    } catch (e) { setVipResponse('Ôi hỏng rồi, có lỗi xảy ra! 😭'); } finally { setIsVipChatting(false); }
  };
  
  const handleVipCopy = () => { navigator.clipboard.writeText(vipResponse); setIsVipCopied(true); setTimeout(() => setIsVipCopied(false), 2000); };
  const handleResetVip = () => { setVipSituation(''); setVipResponse(''); setIsVipCopied(false); };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '"Comic Sans MS", "Nunito", sans-serif', backgroundColor: '#fff0f5', color: '#4a4a4a' }}>
      <div style={{ width: '250px', backgroundColor: '#ffb6c1', padding: '20px', boxShadow: '2px 0 10px rgba(255,105,180,0.2)' }}>
        <h2 style={{ color: '#fff', textAlign: 'center', textShadow: '1px 1px 2px #ff69b4' }}>🌸 Tủ Đồ Anime 🌸</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '40px' }}>
          <button onClick={() => setActiveTab('products')} style={getTabStyle(activeTab === 'products')}>👗 Quản Lý Áo</button>
          <button onClick={() => setActiveTab('chat')} style={getTabStyle(activeTab === 'chat')}>✨ Đề Xuất Cơ Bản</button>
          <button onClick={() => setActiveTab('aivip')} style={getTabStyle(activeTab === 'aivip')}>👑 AI VIP Tự Động</button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        
        {/* TAB SẢN PHẨM */}
        {activeTab === 'products' && (
          <div style={cardStyle}>
            <h2 style={headerStyle}>🎀 Quản Lý Danh Sách Áo</h2>
            <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Tên áo (VD: Áo trễ vai hồng)..." style={inputStyle} />
              <input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="Link sản phẩm..." style={inputStyle} />
              <button onClick={handleAddOrEdit} style={buttonStyle}>{editingProduct ? '💾 Lưu Lại' : '💖 Thêm Mới'}</button>
            </div>
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="🔍 Tìm kiếm áo nè..." style={{...inputStyle, width: '100%', marginBottom: '20px', background: '#fff0f5'}} />
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr style={{ background: '#ffb6c1', color: '#fff' }}>
                <th style={thStyle}>Trạng Thái</th><th style={thStyle}>Tên Áo</th><th style={thStyle}>Đường Link</th><th style={thStyle}>Hành Động</th>
              </tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #ffe4e1', background: p.is_visible ? 'transparent' : '#f0f0f0' }}>
                    <td style={tdStyle}>
                      <button onClick={() => handleToggleVisibility(p)} title="Bấm để đổi trạng thái" style={{...actionBtnStyle, fontSize: '20px'}}>
                        {p.is_visible ? '👁️' : '🙈'}
                      </button>
                    </td>
                    <td style={{...tdStyle, color: p.is_visible ? 'inherit' : '#a0a0a0'}}>{p.name} {p.is_visible ? '' : '(Đã ẩn)'}</td>
                    <td style={tdStyle}><a href={p.link} target="_blank" style={{ color: p.is_visible ? '#ff69b4' : '#a0a0a0' }}>Xem Link</a></td>
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

        {/* TAB ĐỀ XUẤT */}
        {activeTab === 'chat' && (
          <div style={{...cardStyle, maxWidth: '800px', margin: '0 auto'}}>
            <h2 style={{...headerStyle, textAlign: 'center'}}>💌 Tư Vấn Bán Hàng (Chọn Tay)</h2>
            <p style={labelStyle}>Tình huống khách hàng:</p>
            <textarea value={situation} onChange={e => setSituation(e.target.value)} rows={3} placeholder="VD: Khách nữ 20 tuổi..." style={{...inputStyle, width: '100%', marginBottom: '15px'}} />
            <p style={labelStyle}>Chọn áo để gợi ý:</p>
            <select value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} style={{...inputStyle, width: '100%', marginBottom: '20px'}}>
              <option value="">-- Click để chọn 1 mẫu áo từ Tủ Đồ nha --</option>
              {/* CHỈ LỌC RA ÁO ĐANG HIỆN */}
              {products.filter(p => p.is_visible).map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleChat} disabled={isChatting} style={{...buttonStyle, flex: 1, padding: '15px', fontSize: '18px'}}>{isChatting ? 'Đang viết lời nhắn... 🌸' : '✨ Tư Vấn Xong, Trả Kết Quả ✨'}</button>
              <button onClick={handleResetChat} style={{...buttonStyle, background: '#fff', color: '#ff69b4', border: '2px solid #ff69b4', padding: '15px', fontSize: '18px'}}>🔄 Làm Mới</button>
            </div>
            {chatResponse && (<div style={responseBoxStyle}><button onClick={handleCopy} style={copyBtnStyle}>{isCopied ? '✅' : '📋'}</button>{chatResponse}</div>)}
          </div>
        )}

        {/* TAB AI VIP */}
        {activeTab === 'aivip' && (
          <div style={{...cardStyle, maxWidth: '800px', margin: '0 auto', border: '2px solid #ff69b4'}}>
            <h2 style={{...headerStyle, textAlign: 'center'}}>👑 Siêu Trợ Lý AI VIP</h2>
            <p style={{textAlign: 'center', marginBottom: '20px', color: '#ff69b4'}}>Bạn chỉ cần nhập tình huống, AI sẽ tự quét đồ ĐANG HIỆN và chọn đồ!</p>
            <textarea value={vipSituation} onChange={e => setVipSituation(e.target.value)} rows={4} placeholder="VD: Khách đi biển..." style={{...inputStyle, width: '100%', marginBottom: '20px'}} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleVipChat} disabled={isVipChatting} style={{...buttonStyle, flex: 1, padding: '15px', fontSize: '18px', background: 'linear-gradient(45deg, #ff69b4, #ff1493)'}}>{isVipChatting ? 'AI đang quét tủ đồ... 🪄✨' : '🚀 AI Tự Động Chọn Đồ & Tư Vấn 🚀'}</button>
              <button onClick={handleResetVip} style={{...buttonStyle, background: '#fff', color: '#ff1493', border: '2px solid #ff1493', padding: '15px', fontSize: '18px'}}>🔄 Làm Mới</button>
            </div>
            {vipResponse && (<div style={{...responseBoxStyle, background: '#fff', border: '3px solid #ffb6c1'}}><button onClick={handleVipCopy} style={copyBtnStyle}>{isVipCopied ? '✅' : '📋'}</button>{vipResponse}</div>)}
          </div>
        )}
      </div>
    </div>
  );
}

const getTabStyle = (isActive: boolean) => ({ padding: '12px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: isActive ? '#fff' : 'transparent', color: isActive ? '#ff69b4' : '#fff', fontWeight: 'bold', fontSize: '16px', transition: '0.3s' });
const cardStyle = { background: '#fff', padding: '30px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(255,182,193,0.3)' };
const headerStyle = { color: '#ff69b4', borderBottom: '2px dashed #ffb6c1', paddingBottom: '10px' };
const labelStyle = { fontWeight: 'bold', color: '#ff69b4', marginBottom: '5px' };
const inputStyle = { padding: '10px', borderRadius: '10px', border: '1px solid #ffb6c1', outline: 'none', fontSize: '15px' };
const buttonStyle = { background: '#ff69b4', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' };
const thStyle = { padding: '12px', borderBottom: '2px solid #fff' };
const tdStyle = { padding: '12px' };
const actionBtnStyle = { background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', marginRight: '10px' };
const responseBoxStyle: React.CSSProperties = { position: 'relative', marginTop: '30px', background: '#fff0f5', padding: '20px', borderRadius: '15px', border: '2px dashed #ffb6c1', whiteSpace: 'pre-wrap', lineHeight: '1.6' };
const copyBtnStyle: React.CSSProperties = { position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '5px' };