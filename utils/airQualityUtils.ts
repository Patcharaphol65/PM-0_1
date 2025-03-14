// ฟังก์ชันกำหนดสถานะคุณภาพอากาศและอีโมจิ
export interface StatusInfo {
    status: string;
    emoji: string;
    color: string;
    textColor: string;
    backgroundColor: string;
  }
  
  export const getSafetyStatus = (value: number): StatusInfo => {
    if (value <= 15) {
      return {
        status: "ดีมาก",
        emoji: "😃",
        color: "#4CAF50", // เขียว
        textColor: "#4CAF50",
        backgroundColor: "#1B5E20"
      };
    } else if (value <= 25) {
      return {
        status: "ดี",
        emoji: "😊",
        color: "#8BC34A", // เขียวอ่อน
        textColor: "#8BC34A",
        backgroundColor: "#33691E"
      };
    } else if (value <= 37) {
      return {
        status: "ปานกลาง",
        emoji: "😐",
        color: "#FFEB3B", // เหลือง
        textColor: "#FFEB3B",
        backgroundColor: "#7D6608"
      };
    } else if (value <= 50) {
      return {
        status: "เริ่มมีผลกระทบ",
        emoji: "🤧",
        color: "#FF9800", // ส้ม
        textColor: "#FF9800",
        backgroundColor: "#E65100"
      };
    } else if (value <= 90) {
      return {
        status: "ไม่ดีต่อสุขภาพ",
        emoji: "😷",
        color: "#F44336", // แดง
        textColor: "#F44336",
        backgroundColor: "#8A160C"
      };
    } else {
      return {
        status: "อันตราย",
        emoji: "☠️",
        color: "#880E4F", // ม่วงเข้ม
        textColor: "#880E4F",
        backgroundColor: "#4A024F"
      };
    }
  };
  
  
  // ฟังก์ชันคำนวณสีของแถบ PM ตามค่า
  export const getPMIndicatorColor = (value: number): string => {
    if (value <= 15) {
      return "#4CAF50"; // สีเขียวเข้ม (ดีมาก)
    } else if (value <= 25) {
      return "#8BC34A"; // สีเขียวอ่อน (ดี)
    } else if (value <= 37) {
      return "#998000"; // สีเหลือง (ปานกลาง)
    } else if (value <= 50) {
      return "#FF9800"; // สีส้ม (เริ่มมีผลกระทบ)
    } else if (value <= 90) {
      return "#F44336"; // สีแดง (ไม่ดีต่อสุขภาพ)
    } else {
      return "#880E4F"; // สีม่วงเข้ม (อันตราย)
    }
  };
  