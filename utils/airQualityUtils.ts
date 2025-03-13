// ฟังก์ชันกำหนดสถานะคุณภาพอากาศและอีโมจิ
export interface StatusInfo {
    status: string;
    emoji: string;
    color: string;
    textColor: string;
    backgroundColor: string;
  }
  
  export const getSafetyStatus = (value: number): StatusInfo => {
    // ปรับเกณฑ์เป็น 3 ระดับ ตามที่กำหนด
    if (value <= 25) {
      return {
        status: "ปลอดภัย",
        emoji: "😊",
        color: "#4CAF50", // สีเขียว
        textColor: "#4CAF50",
        backgroundColor: "#1B5E20"
      };
    } else if (value <= 100) {
      return {
        status: "เสี่ยง",
        emoji: "😐",
        color: "#FFC107", // สีเหลือง
        textColor: "#FFC107",
        backgroundColor: "#7D6608"
      };
    } else {
      return {
        status: "อันตราย",
        emoji: "😷",
        color: "#F44336", // สีแดง
        textColor: "#F44336",
        backgroundColor: "#8A160C"
      };
    }
  };
  
  // ฟังก์ชันคำนวณสีของแถบ PM ตามค่า
  export const getPMIndicatorColor = (value: number): string => {
    if (value <= 25) {
      return "#4CAF50"; // สีเขียว
    } else if (value <= 100) {
      return "#FFC107"; // สีเหลือง
    } else {
      return "#F44336"; // สีแดง
    }
  };