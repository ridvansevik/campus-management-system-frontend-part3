import { useState, useEffect } from 'react';
import { getResourceUtilization } from '../../services/scheduleService';
import Layout from '../../components/Layout';

const ResourceUtilization = () => {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await getResourceUtilization();
        if (response.data.success) {
          setReport(response.data.data);
        }
      } catch (err) {
        console.error("Rapor hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <Layout title="Kaynak Kullanım Raporu">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-6">Derslik Doluluk Oranları</h2>
        
        {loading ? <p>Hesaplanıyor...</p> : (
          <div className="space-y-6">
            {report.map(room => {
              // Yüzdeyi sayıya çevir
              const rate = parseFloat(room.utilizationRate);
              // Renk belirle (Düşük: Yeşil, Orta: Sarı, Yüksek: Kırmızı)
              const barColor = rate > 80 ? 'bg-red-500' : rate > 50 ? 'bg-yellow-500' : 'bg-green-500';

              return (
                <div key={room.classroomId} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-700">{room.code} (Kap: {room.capacity})</span>
                    <span className="text-sm font-bold text-gray-600">{room.utilizationRate}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`${barColor} h-4 rounded-full transition-all duration-500`} 
                      style={{ width: `${rate}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span>Programlı Ders: <strong>{room.scheduledCourses}</strong></span>
                    <span>Rezervasyon: <strong>{room.reservations}</strong></span>
                  </div>
                </div>
              );
            })}
            
            {report.length === 0 && <p className="text-gray-500">Veri bulunamadı.</p>}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ResourceUtilization;