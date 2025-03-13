import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

// ข้อมูลการกำหนดค่า Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCfZbN3I2vHzKfyP8sVz_7Lv0y4OMN4Wi0",
  authDomain: "project-1611547665273613438.firebaseapp.com",
  databaseURL: "https://project-1611547665273613438-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-1611547665273613438",
  storageBucket: "project-1611547665273613438.firebasestorage.app",
  messagingSenderId: "514081659957",
  appId: "1:514081659957:web:bea08cb728c9977ec3657c",
  measurementId: "G-LW2962RQ0C"
};

// เริ่มต้น Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// กำหนดประเภทสำหรับผลลัพธ์การตรวจสอบ
interface DatabaseCheckResult {
  exists: boolean;
  dateCount?: number;
  latestDate?: string | null;
  sample?: any;
  error?: string;
}

// ฟังก์ชันตรวจสอบการเชื่อมต่อฐานข้อมูลทั้งหมด
export const checkAllDatabases = async () => {
  try {
    console.log('เริ่มตรวจสอบข้อมูลทั้งหมด...');
    
    // ตรวจสอบข้อมูลทั้ง 3 path
    const paths = ['data_averaged_1m', 'data_averaged_1h', 'data_averaged_24h'];
    const results: Record<string, DatabaseCheckResult> = {};
    
    for (const path of paths) {
      console.log(`กำลังตรวจสอบ ${path}...`);
      const dataRef = ref(database, path);
      
      try {
        const snapshot = await get(dataRef);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dates = Object.keys(data);
          
          results[path] = {
            exists: true,
            dateCount: dates.length,
            latestDate: dates.length > 0 ? dates[dates.length - 1] : null,
            sample: dates.length > 0 ? data[dates[dates.length - 1]] : null
          };
          
          console.log(`✅ พบข้อมูลใน ${path}`);
          console.log(`   - จำนวนวันที่: ${dates.length}`);
          console.log(`   - วันที่ล่าสุด: ${dates.length > 0 ? dates[dates.length - 1] : 'ไม่มี'}`);
        } else {
          results[path] = { exists: false };
          console.warn(`⚠️ ไม่พบข้อมูลใน ${path}`);
        }
      } catch (error: any) {
        results[path] = { exists: false, error: error.message };
        console.error(`❌ เกิดข้อผิดพลาดในการเข้าถึง ${path}:`, error);
      }
    }
    
    console.log('ผลการตรวจสอบทั้งหมด:', results);
    return results;
  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบฐานข้อมูล:', error);
    return null;
  }
};

// เรียกใช้การตรวจสอบการเชื่อมต่อทั้งหมด
checkAllDatabases();