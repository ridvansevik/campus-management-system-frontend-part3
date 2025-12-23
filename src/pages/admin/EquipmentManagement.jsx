import { useState, useEffect } from 'react';
import { getAllEquipment, borrowEquipment, returnEquipment } from '../../services/equipmentService';
import Layout from '../../components/Layout';

const EquipmentManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Basit Modal Durumu
  const [selectedItem, setSelectedItem] = useState(null);
  const [dueDate, setDueDate] = useState('');

  const fetchEquipment = async () => {
    try {
      const response = await getAllEquipment();
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (err) {
      setError('Ekipman listesi alınamadı.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!selectedItem || !dueDate) return;

    try {
      await borrowEquipment({ equipmentId: selectedItem.id, dueDate });
      alert('Ödünç işlemi başarılı!');
      setSelectedItem(null);
      fetchEquipment(); // Listeyi yenile
    } catch (err) {
      alert(err.response?.data?.message || 'Bir hata oluştu.');
    }
  };

  const handleReturn = async (loanId) => {
    if (!confirm('Bu ekipmanı iade almak istediğinize emin misiniz?')) return;
    try {
      await returnEquipment({ loanId });
      alert('İade alındı.');
      fetchEquipment();
    } catch (err) {
      alert('İade işlemi başarısız.');
    }
  };

  return (
    <Layout title="Ekipman Yönetimi">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Envanter Listesi</h2>
        
        {loading ? <p>Yükleniyor...</p> : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3">Adı</th>
                  <th className="p-3">Tür</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3">Seri No</th>
                  <th className="p-3">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.type}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'available' ? 'bg-green-100 text-green-800' :
                        item.status === 'borrowed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100'
                      }`}>
                        {item.status === 'available' ? 'Müsait' : 
                         item.status === 'borrowed' ? 'Ödünçte' : item.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{item.serial_number}</td>
                    <td className="p-3">
                      {item.status === 'available' && (
                        <button 
                          onClick={() => setSelectedItem(item)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          Ödünç Ver
                        </button>
                      )}
                      {item.status === 'borrowed' && item.loans && item.loans.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-gray-500">
                             {/* Aktif loan ID'sini bulmak gerekebilir, backend loans array dönüyorsa sonuncusu aktiftir */}
                             Kullanıcı: {item.loans[item.loans.length-1].userId}
                          </span>
                          <button 
                            onClick={() => handleReturn(item.loans[item.loans.length-1].id)}
                            className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 text-sm"
                          >
                            İade Al
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ödünç Verme Modalı */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">{selectedItem.name} Ödünç Ver</h3>
              <form onSubmit={handleBorrow}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Son Teslim Tarihi</label>
                  <input 
                    type="date" 
                    required
                    className="w-full border rounded p-2"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedItem(null)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                  >
                    İptal
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Onayla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EquipmentManagement;