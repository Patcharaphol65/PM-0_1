import { useState, useEffect } from 'react';
import { database } from '../firebase/firebaseConfig';
import { ref, onValue } from 'firebase/database';

// กำหนดประเภทของข้อมูล
interface AirQualityData {
  pm0_1: number;
  pm2_5: number;
  temperature: number;
  humidity: number;
  timestamp?: string;
}

// ข้อมูลเริ่มต้น (ค่าว่างเปล่า)
const initialData: AirQualityData = {
  pm0_1: 0,
  pm2_5: 0,
  temperature: 0,
  humidity: 0
};

/**
 * Custom hook สำหรับดึงข้อมูลคุณภาพอากาศแบบเรียลไทม์
 * @param type ประเภทข้อมูล 'latest' หรือ 'average' หรือ 'daily'
 * @returns ข้อมูลคุณภาพอากาศ, สถานะการโหลด, และข้อผิดพลาด
 */
export const useAirQualityData = (type: 'latest' | 'average' | 'daily') => {
  const [airData, setAirData] = useState<AirQualityData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // กำหนดพาธสำหรับดึงข้อมูล
    let dataPath: string;
    
    switch (type) {
      case 'latest':
        dataPath = 'data_averaged_1m';
        break;
      case 'average':
        dataPath = 'data_averaged_1h';
        break;
      case 'daily':
        dataPath = 'data_averaged_24h';
        break;
    }
    
    console.log(`กำลังดึงข้อมูลแบบเรียลไทม์จาก ${dataPath}`);
    const dataRef = ref(database, dataPath);
    
    // ใช้ onValue แทน get เพื่อรับฟังการเปลี่ยนแปลงแบบเรียลไทม์
    const unsubscribe = onValue(dataRef, (snapshot) => {
      try {
        if (!snapshot.exists()) {
          throw new Error(`ไม่พบข้อมูลใน ${dataPath}`);
        }
        
        // ดึงข้อมูลจาก snapshot
        const data = snapshot.val();
        
        // หาข้อมูลล่าสุด
        const dates = Object.keys(data).sort();
        
        if (dates.length === 0) {
          throw new Error(`ไม่พบข้อมูลวันที่ล่าสุดใน ${dataPath}`);
        }
        
        const latestDate = dates[dates.length - 1];
        const latestEntry = data[latestDate];
        
        if (!latestEntry) {
          throw new Error(`ข้อมูลล่าสุด ${latestDate} ไม่ถูกต้อง`);
        }
        
        console.log(`พบข้อมูลล่าสุด: ${latestDate}`, latestEntry);
        
        // สร้าง airQualityData จากข้อมูลล่าสุด
        const airQualityData: AirQualityData = {
          pm0_1: latestEntry.pm0_1_predicted || 0,
          pm2_5: latestEntry.pm2_5 || 0,
          temperature: latestEntry.temperature || 0,
          humidity: latestEntry.humidity || 0,
          timestamp: latestDate
        };
        
        console.log(`ข้อมูลที่จะส่งกลับ:`, airQualityData);
        setAirData(airQualityData);
        setLoading(false);
      } catch (err) {
        console.error('Error processing air quality data:', err);
        setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการประมวลผลข้อมูล');
        setLoading(false);
      }
    }, (err) => {
      console.error('Error fetching air quality data:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล');
      setLoading(false);
    });
    
    // Cleanup function - ยกเลิกการสมัครรับข้อมูลเมื่อคอมโพเนนต์ถูกทำลาย
    return () => unsubscribe();
    
  }, [type]);
  
  return { airData, loading, error };
};