import React, { useState, useEffect} from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import { database } from "../firebase/firebaseConfig";
import { ref, get, query, limitToLast, orderByKey } from "firebase/database";
import { useAirQualityData } from "../hooks/useAirQualityData";

// useFocusEffect 
import { useFocusEffect } from "expo-router";

interface StatsScreenProps {
  navigation: any;
}

// Chart data interface definitions
interface ChartDataset {
  data: number[];
  colors?: ((opacity: number) => string)[];
}

interface ChartDataType {
  labels: string[];
  datasets: ChartDataset[];
}

// PM Chart Component
const PMChart = () => {
  // Sample PM data types
  type PMTypesKey = "PM 0.1" | "PM 2.5";
  const pmTypes: PMTypesKey[] = ["PM 0.1", "PM 2.5"];
  const [selectedPM, setSelectedPM] = useState<PMTypesKey>("PM 0.1");
  const [showPMDropdown, setShowPMDropdown] = useState(false);
  
  // Initial empty data structure
  const initialPmData: Record<PMTypesKey, number[]> = {
    "PM 0.1": [],
    "PM 2.5": []
  };
  
  const [pmData, setPmData] = useState(initialPmData);
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("01-01-2024");
  const [endDate, setEndDate] = useState("07-01-2024");
  const [minMaxValues, setMinMaxValues] = useState({ min: 0, max: 0 });
  const [loading, setLoading] = useState(true);
  
  // เพิ่มส่วนนี้: state สำหรับข้อมูลเมื่อกดแท่งกราฟ
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [showBarData, setShowBarData] = useState(false);
  const [selectedBarData, setSelectedBarData] = useState<any>(null);
  
  // Calculated chart data based on selected PM type
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: dateLabels,
    datasets: [
      {
        data: pmData["PM 0.1"],
        colors: Array(7).fill((opacity = 1) => `rgba(194, 215, 51, ${opacity})`) // สีเขียวอ่อน-เหลือง ตามภาพตัวอย่าง
      },
    ],
  });

  // ดึงข้อมูลจาก Firebase
  useEffect(() => {
    const fetchPMData = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลล่าสุดจาก data_averaged_24h
        const dataRef = ref(database, 'data_averaged_24h');
        const dataQuery = query(dataRef, orderByKey(), limitToLast(7)); // ดึงข้อมูล 7 วันล่าสุด
        const snapshot = await get(dataQuery);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dates = Object.keys(data).sort(); // เรียงวันที่
          
          // สร้างป้ายกำกับวันที่
          const formattedDates = dates.map(date => {
            // แปลงรูปแบบวันที่ YYYY-MM-DD เป็น DD ม.ค.
            const [year, month, day] = date.split('-');
            const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            return `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`;
          });
          
          setDateLabels(formattedDates);
          
          // สร้างข้อมูลกราฟ
          const pm01Values: number[] = [];
          const pm25Values: number[] = [];
          
          dates.forEach(date => {
            // ดึงข้อมูลแต่ละวันโดยตรงจากโครงสร้างใหม่
            if (data[date]) {
              pm01Values.push(parseFloat(data[date].pm0_1_predicted?.toFixed(2)) || 0);
              pm25Values.push(parseFloat(data[date].pm2_5?.toFixed(2)) || 0);
            } else {
              pm01Values.push(0);
              pm25Values.push(0);
            }
          });
          
          // อัปเดต state
          setPmData({
            "PM 0.1": pm01Values,
            "PM 2.5": pm25Values
          });
          
          // หาค่า min และ max
          const currentValues = selectedPM === "PM 0.1" ? pm01Values : pm25Values;
          const filteredValues = currentValues.filter(v => v > 0);
          setMinMaxValues({
            min: filteredValues.length > 0 ? Math.min(...filteredValues) : 0,
            max: Math.max(...currentValues, 0.1) // ใส่ค่า 0.1 เป็นค่าน้อยสุดในกรณีที่ไม่มีข้อมูล
          });
          
          // อัปเดตวันที่เริ่มต้นและสิ้นสุด
          if (dates.length >= 2) {
            setStartDate(dates[0]);
            setEndDate(dates[dates.length - 1]);
          }
          
          // อัปเดตข้อมูลกราฟ
          setChartData({
            labels: formattedDates,
            datasets: [
              {
                data: selectedPM === "PM 0.1" ? pm01Values : pm25Values,
                // แก้ไขสีกราฟ PM เป็นสีเขียวอ่อน-เหลือง ตามภาพตัวอย่าง
                colors: Array(dates.length).fill((opacity = 1) => `rgba(194, 215, 51, ${opacity})`)
              },
            ],
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching PM data:", error);
        setLoading(false);
      }
    };
    
    fetchPMData();
  }, [selectedPM]);

  // Update chart data when PM type changes
  const handleSelectPM = (type: PMTypesKey) => {
    setSelectedPM(type);
    setShowPMDropdown(false);
    
    const currentValues = pmData[type];
    const filteredValues = currentValues.filter(v => v > 0);
    setMinMaxValues({
      min: filteredValues.length > 0 ? Math.min(...filteredValues) : 0,
      max: Math.max(...currentValues, 0.1)
    });
    
    setChartData({
      labels: dateLabels,
      datasets: [
        {
          data: pmData[type],
          // แก้ไขสีกราฟ PM เป็นสีเขียวอ่อน-เหลือง ตามภาพตัวอย่าง
          colors: Array(dateLabels.length).fill((opacity = 1) => `rgba(194, 215, 51, ${opacity})`)
        },
      ],
    });
  };
  
  // เพิ่มฟังก์ชันนี้: จัดการเมื่อกดที่แท่งกราฟ
  const handleBarPress = (index: number) => {
    // เก็บข้อมูลวันที่และค่าของแท่งกราฟที่กด
    const dateLabel = dateLabels[index];
    const value = pmData[selectedPM][index];
    
    // สร้างออบเจ็กต์สำหรับข้อมูลของแท่งกราฟที่เลือก
    const barData = {
      date: dateLabel,
      type: selectedPM,
      value: value.toFixed(2)
    };
    
    // อัปเดต state
    setSelectedBarIndex(index);
    setSelectedBarData(barData);
    setShowBarData(true);
    
    // ซ่อนป็อปอัพโดยอัตโนมัติหลังจาก 3 วินาที
    setTimeout(() => {
      setShowBarData(false);
    }, 3000);
  };

  // แก้ไขให้ใช้ screenWidth ที่มีการปรับขนาดเพื่อไม่ให้เกินกรอบ
  const screenWidth = Dimensions.get("window").width - 65; // ลดขนาดลงเพิ่มเติมเพื่อป้องกันเกินกรอบ

  if (loading) {
    return (
      <View style={styles.chartCard}>
        <View style={styles.loadingChartContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingChartText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartHeaderText}>{selectedPM.replace(" ", "")} ย้อนหลัง 7 วัน</Text>
        <View>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowPMDropdown(!showPMDropdown)}
          >
            <Text style={styles.dropdownButtonText}>{selectedPM} ▼</Text>
          </TouchableOpacity>
          
          {showPMDropdown && (
            <View style={styles.dropdownMenu}>
              {pmTypes.map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[
                    styles.dropdownItem,
                    selectedPM === type && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleSelectPM(type)}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      
      {/* แก้ไขส่วนนี้ ใช้วิธีวาง TouchableOpacity ทับแท่งกราฟ */}
      <TouchableWithoutFeedback onPress={() => setShowBarData(false)}>
        <View>
          <BarChart
            data={chartData}
            width={screenWidth}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#FDFBEE",
              backgroundGradientFrom: "#FDFBEE",
              backgroundGradientTo: "#FDFBEE",
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(84, 51, 16, ${opacity})`, //เส้นกราฟ
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,//วันที่
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.5, // ลดจาก 0.6 เพื่อให้มีช่องว่างมากขึ้น
              propsForHorizontalLabels: {
                fontSize: 9,
                rotation: 0,
              },
              propsForVerticalLabels: {
                fontSize: 9,
              },
              formatYLabel: (value) => Math.min(parseFloat(value), minMaxValues.max * 1.2).toFixed(1),
            }}
            style={{
              borderRadius: 8,
              paddingRight: 10, // เพิ่ม padding ทางขวา
              marginRight: 5,  // เพิ่ม margin
            }}
            showValuesOnTopOfBars={false}
            fromZero
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withInnerLines={true}
            segments={5}
            horizontalLabelRotation={0}
          />
          
          {/* เพิ่มแถบสำหรับรับการแตะทับแท่งกราฟ */}
          <View style={styles.touchBarContainer}>
            {chartData.labels.map((label, index) => (
              <TouchableOpacity
                key={index}
                style={styles.touchBar}
                onPress={() => handleBarPress(index)}
              />
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
      
      {/* ป็อปอัพสำหรับแสดงข้อมูลแท่งกราฟ */}
      {showBarData && selectedBarData && (
        <View style={styles.barDataPopup}>
          <Text style={styles.barDataTitle}>{selectedBarData.type} - {selectedBarData.date}</Text>
          <Text style={styles.barDataValue}>{selectedBarData.value} μg/m³</Text>
        </View>
      )}
      
      <View style={styles.timeLabel}>
        <Text style={styles.timeLabelText}>{startDate}</Text>
        <Text style={styles.timeLabelTextRight}>{endDate}</Text>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          {/* แก้ไขสี legend ให้ตรงกับภาพตัวอย่าง - สีเขียว วงกลมPM */}
          <View style={[styles.legendDot, {backgroundColor: '#4CAF50'}]}></View>
          <Text style={styles.legendText}>Min {minMaxValues.min.toFixed(1)}</Text>
        </View>
        <View style={styles.legendItem}>
          {/* แก้ไขสี legend Max เป็นสีแดง ตามภาพตัวอย่าง */}
          <View style={[styles.legendDot, {backgroundColor: '#ff0000'}]}></View>
          <Text style={styles.legendText}>Max {minMaxValues.max.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
};

// Temperature Chart Component
const TemperatureChart = () => {
  // Temperature and humidity options
  type MeasurementTypesKey = "อุณหภูมิ" | "ความชื้น";
  const measurementTypes: MeasurementTypesKey[] = ["อุณหภูมิ", "ความชื้น"];
  const [selectedType, setSelectedType] = useState<MeasurementTypesKey>("อุณหภูมิ");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  // Initial empty data structure
  const initialMeasurementData: Record<MeasurementTypesKey, number[]> = {
    "อุณหภูมิ": [],
    "ความชื้น": []
  };
  
  const [measurementData, setMeasurementData] = useState(initialMeasurementData);
  const [dateLabels, setDateLabels] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("01-01-2024");
  const [endDate, setEndDate] = useState("07-01-2024");
  const [minMaxValues, setMinMaxValues] = useState({ min: 0, max: 0 });
  const [loading, setLoading] = useState(true);
  
  // เพิ่มส่วนนี้: state สำหรับข้อมูลเมื่อกดแท่งกราฟ
  const [selectedBarIndex, setSelectedBarIndex] = useState<number | null>(null);
  const [showBarData, setShowBarData] = useState(false);
  const [selectedBarData, setSelectedBarData] = useState<any>(null);
  
  // Chart data state
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: dateLabels,
    datasets: [
      {
        data: measurementData["อุณหภูมิ"],
        colors: Array(7).fill((opacity = 1) => `rgba(33, 150, 243, ${opacity})`) // สีฟ้า ตามภาพตัวอย่าง
      },
    ],
  });
  
  // ดึงข้อมูลจาก Firebase
  useEffect(() => {
    const fetchMeasurementData = async () => {
      try {
        setLoading(true);
        
        // ดึงข้อมูลล่าสุดจาก data_averaged_24h
        const dataRef = ref(database, 'data_averaged_24h');
        const dataQuery = query(dataRef, orderByKey(), limitToLast(7)); // ดึงข้อมูล 7 วันล่าสุด
        const snapshot = await get(dataQuery);
        
        if (snapshot.exists()) {
          const data = snapshot.val();
          const dates = Object.keys(data).sort(); // เรียงวันที่
          
          // สร้างป้ายกำกับวันที่
          const formattedDates = dates.map(date => {
            // แปลงรูปแบบวันที่ YYYY-MM-DD เป็น DD ม.ค.
            const [year, month, day] = date.split('-');
            const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            return `${parseInt(day)} ${monthNames[parseInt(month) - 1]}`;
          });
          
          setDateLabels(formattedDates);
          
          // สร้างข้อมูลกราฟ
          const tempValues: number[] = [];
          const humidityValues: number[] = [];
          
          dates.forEach(date => {
            // ดึงข้อมูลแต่ละวันโดยตรงจากโครงสร้างใหม่
            if (data[date]) {
              tempValues.push(parseFloat(data[date].temperature?.toFixed(1)) || 0);
              humidityValues.push(parseFloat(data[date].humidity?.toFixed(1)) || 0);
            } else {
              tempValues.push(0);
              humidityValues.push(0);
            }
          });
          
          // อัปเดต state
          setMeasurementData({
            "อุณหภูมิ": tempValues,
            "ความชื้น": humidityValues
          });
          
          // หาค่า min และ max
          const currentValues = selectedType === "อุณหภูมิ" ? tempValues : humidityValues;
          const filteredValues = currentValues.filter(v => v > 0);
          setMinMaxValues({
            min: filteredValues.length > 0 ? Math.min(...filteredValues) : 0,
            max: Math.max(...currentValues, 0.1)
          });
          
          // อัปเดตวันที่เริ่มต้นและสิ้นสุด
          if (dates.length >= 2) {
            setStartDate(dates[0]);
            setEndDate(dates[dates.length - 1]);
          }
          
          // อัปเดตข้อมูลกราฟ
          setChartData({
            labels: formattedDates,
            datasets: [
              {
                data: selectedType === "อุณหภูมิ" ? tempValues : humidityValues,
                // แก้ไขสีเป็นสีฟ้าสำหรับทั้งอุณหภูมิและความชื้น ตามภาพตัวอย่าง
                colors: Array(dates.length).fill((opacity = 1) => `rgba(33, 150, 243, ${opacity})`)
              },
            ],
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching measurement data:", error);
        setLoading(false);
      }
    };
    
    fetchMeasurementData();
  }, [selectedType]);
  
  // Update chart data when measurement type changes
  const handleSelectType = (type: MeasurementTypesKey) => {
    setSelectedType(type);
    setShowTypeDropdown(false);
    
    // สีฟ้าสำหรับทั้งอุณหภูมิและความชื้น ตามภาพตัวอย่าง
    const color = (opacity = 1) => `rgba(33, 150, 243, ${opacity})`; // สีฟ้าเหมือนกันทั้งคู่
    
    const currentValues = measurementData[type];
    const filteredValues = currentValues.filter(v => v > 0);
    setMinMaxValues({
      min: filteredValues.length > 0 ? Math.min(...filteredValues) : 0,
      max: Math.max(...currentValues, 0.1)
    });
    
    setChartData({
      labels: dateLabels,
      datasets: [
        {
          data: measurementData[type],
          colors: Array(dateLabels.length).fill(color)
        },
      ],
    });
  };

  // เพิ่มฟังก์ชันนี้: จัดการเมื่อกดที่แท่งกราฟ
  const handleBarPress = (index: number) => {
    // เก็บข้อมูลวันที่และค่าของแท่งกราฟที่กด
    const dateLabel = dateLabels[index];
    const value = measurementData[selectedType][index];
    
    // กำหนดหน่วยตามประเภทการวัด
    const unit = selectedType === "อุณหภูมิ" ? "°C" : "%";
    
    // สร้างออบเจ็กต์สำหรับข้อมูลของแท่งกราฟที่เลือก
    const barData = {
      date: dateLabel,
      type: selectedType,
      value: value.toFixed(1),
      unit: unit
    };
    
    // อัปเดต state
    setSelectedBarIndex(index);
    setSelectedBarData(barData);
    setShowBarData(true);
    
    // ซ่อนป็อปอัพโดยอัตโนมัติหลังจาก 3 วินาที
    setTimeout(() => {
      setShowBarData(false);
    }, 3000);
  };

  // แก้ไขให้ใช้ screenWidth ที่มีการปรับขนาดเพื่อไม่ให้เกินกรอบ
  const screenWidth = Dimensions.get("window").width - 50; // ลดขนาดลงเพื่อป้องกันเกินกรอบ

  if (loading) {
    return (
      <View style={styles.chartCard}>
        <View style={styles.loadingChartContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.loadingChartText}>กำลังโหลดข้อมูล...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartHeaderText}>{selectedType} ย้อนหลัง 7 วัน</Text>
        <View>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowTypeDropdown(!showTypeDropdown)}
          >
            <Text style={styles.dropdownButtonText}>{selectedType} ▼</Text>
          </TouchableOpacity>
          
          {showTypeDropdown && (
            <View style={styles.dropdownMenu}>
              {measurementTypes.map((type) => (
                <TouchableOpacity 
                  key={type} 
                  style={[
                    styles.dropdownItem,
                    selectedType === type && styles.dropdownItemSelected
                  ]}
                  onPress={() => handleSelectType(type)}
                >
                  <Text style={styles.dropdownItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
      
      {/* แก้ไขส่วนนี้ ใช้วิธีวาง TouchableOpacity ทับแท่งกราฟ */}
      <TouchableWithoutFeedback onPress={() => setShowBarData(false)}>
        <View>
          <BarChart
            data={chartData}
            width={screenWidth}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={{
              backgroundColor: "#FDFBEE", //ข้างในกราฟต้องเปลี่ยน3อัน
              backgroundGradientFrom: "#FDFBEE",
              backgroundGradientTo: "#FDFBEE",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(84, 51, 16, ${opacity})`, //กราฟ
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, //วันที่
              style: {
                borderRadius: 16,
              },
              barPercentage: 0.5, // ลดจาก 0.6 เพื่อให้มีช่องว่างมากขึ้น
              propsForHorizontalLabels: {
                fontSize: 9,
                rotation: 0,
              },
              propsForVerticalLabels: {
                fontSize: 9,
              },
              formatYLabel: (value) => Math.min(parseFloat(value), minMaxValues.max * 1.2).toFixed(0),
            }}
            style={{
              borderRadius: 8,
              paddingRight: 10, // เพิ่ม padding ทางขวา
              marginRight: 5,  // เพิ่ม margin
            }}
            showValuesOnTopOfBars={false}
            fromZero
            withHorizontalLabels={true}
            withVerticalLabels={true}
            withInnerLines={true}
            segments={5}
            horizontalLabelRotation={0}
          />
          
          {/* เพิ่มแถบสำหรับรับการแตะทับแท่งกราฟ */}
          <View style={styles.touchBarContainer}>
            {chartData.labels.map((label, index) => (
              <TouchableOpacity
                key={index}
                style={styles.touchBar}
                onPress={() => handleBarPress(index)}
              />
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
      
      {/* ป็อปอัพสำหรับแสดงข้อมูลแท่งกราฟ */}
      {showBarData && selectedBarData && (
        <View style={styles.barDataPopup}>
          <Text style={styles.barDataTitle}>{selectedBarData.type} - {selectedBarData.date}</Text>
          <Text style={styles.barDataValue}>{selectedBarData.value} {selectedBarData.unit}</Text>
        </View>
      )}
      
      <View style={styles.timeLabel}>
        <Text style={styles.timeLabelText}>{startDate}</Text>
        <Text style={styles.timeLabelTextRight}>{endDate}</Text>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          {/* แก้ไขสี legend เป็นสีเขียว วงกลม อุณหภูมิ */}
          <View style={[styles.legendDot, {backgroundColor: '#4CAF50'}]}></View>
          <Text style={styles.legendText}>Min {minMaxValues.min.toFixed(1)}</Text>
        </View>
        <View style={styles.legendItem}>
          {/* แก้ไขสี legend Max เป็นสีแดง ตามภาพตัวอย่าง */}
          <View style={[styles.legendDot, {backgroundColor: '#ff0000'}]}></View>
          <Text style={styles.legendText}>Max {minMaxValues.max.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
};

// Main StatsScreen Component
const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const { airData, loading: hookLoading, error: hookError } = useAirQualityData('daily');

  // Log data for debugging
  useEffect(() => {
    console.log("Air data from hook:", airData);
  }, [airData]);

  // โหลดใหม่ทุกครั้งเมื่อเข้ามา
  useFocusEffect(
    React.useCallback(() => {
      console.log('Stats screen focused - ready to display data');
    }, [])
  );

  // หน้าหลักจะไม่มีการโหลดข้อมูลเพิ่มเติม เพราะเราโหลดข้อมูลในแต่ละ chart แยกกัน
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.headerText}>กราฟแสดงข้อมูล</Text>
        
        {hookLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>กำลังโหลดข้อมูล...</Text>
          </View>
        ) : hookError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>เกิดข้อผิดพลาด: {hookError}</Text>
          </View>
        ) : (
          <>
            <PMChart />
            <TemperatureChart />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ปรับปรุง Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff", //พื้นหลัง
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Black", //คำกราฟแสดงข้อมูล
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "#ffffff",
    marginTop: 10,
  },
  errorContainer: {
    padding: 20,
    backgroundColor: "#ff000022",
    borderRadius: 8,
  },
  errorText: {
    color: "#ff5252",
  },
  chartCard: {
    backgroundColor: "#FDFBEE", //กรอบ
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    // เพิ่ม shadow เพื่อแยกส่วนให้ชัดเจนขึ้น
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // เพิ่ม overflow: 'hidden' เพื่อป้องกันเนื้อหาเกินกรอบ
    overflow: 'hidden',
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingHorizontal: 4,
    alignItems: "center",
  },
  chartHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "Black", //คำข้างใส่กรอบPM
  },
  dropdownButton: {
    backgroundColor: "#AF8F6F",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  dropdownButtonText: {
    color: "Black", //ดำเลือก PM และ อุณหภูมิ
    fontSize: 14,
  },
  dropdownMenu: {
    position: "absolute",
    top: 32,
    right: 0,
    backgroundColor: "#AF8F6F",
    borderRadius: 8,
    padding: 4,
    zIndex: 100,
    width: 100,
    // เพิ่ม shadow ให้ UI ดีขึ้น
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  dropdownItemSelected: {
    backgroundColor: "#D5C7A3",
  },
  dropdownItemText: {
    color: "Black", //คำที่อยู่ในตัวเลือก
    fontSize: 14,
  },
  loadingChartContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingChartText: {
    color: "#ffffff",
    marginTop: 8,
  },
  timeLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    paddingHorizontal: 10,
    // ปรับปรุงให้อยู่ในกรอบ
    width: '95%',
    alignSelf: 'center',
  },
  timeLabelText: {
    color: "Black", //คำวันที่ ข้างหน้า
    fontSize: 10,
  },
  timeLabelTextRight: {
    color: "Black",//คำวันที่ ข้างหลัง
    fontSize: 10,
    textAlign: "right",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    color: "Black", // คำMinกับMax
    fontSize: 12,
  },
  // เพิ่มสไตล์สำหรับป็อปอัพแสดงข้อมูลแท่งกราฟ
  barDataPopup: {
    position: 'absolute',
    backgroundColor: 'rgba(213, 199, 163, 0.9)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    // จัดตำแหน่งป็อปอัพให้อยู่ตรงกลาง
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -40 }],
    // ขนาดและเงา
    width: 150,
    minHeight: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 1000,
  },
  barDataTitle: {
    color: 'Black',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  barDataValue: {
    color: '#4CAF50',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // เพิ่มสไตล์สำหรับการรองรับการแตะที่แท่งกราฟ
  touchBarContainer: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    width: '100%',
    height: '100%',
    paddingHorizontal: 30, // ปรับให้เข้ากับแกน Y
    paddingBottom: 30, // ปรับให้เข้ากับแกน X
  },
  touchBar: {
    width: '10%', // ปรับความกว้างตามจำนวนแท่งกราฟ
    height: '70%', // ความสูงของพื้นที่รับการแตะ
    // backgroundColor: 'rgba(255, 0, 0, 0.1)', // ใส่เพื่อดูตำแหน่ง (DEBUG)
  },
});

export default StatsScreen;