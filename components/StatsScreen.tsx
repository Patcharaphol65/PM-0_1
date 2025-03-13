import React, { useState, useEffect} from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
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
  
  // ข้อมูลเริ่มต้น (จะถูกอัปเดตเมื่อได้ข้อมูลจริง)
  const initialPmData: Record<PMTypesKey, number[]> = {
    "PM 0.1": [0.2, 0.4, 0.5, 0.6, 0.8, 1.0, 0.7],
    "PM 2.5": [1.5, 2.1, 2.7, 3.0, 2.8, 2.5, 2.0]
  };
  
  const [pmData, setPmData] = useState(initialPmData);
  const [dateLabels, setDateLabels] = useState<string[]>(["01 ม.ค.", "02 ม.ค.", "03 ม.ค.", "04 ม.ค.", "05 ม.ค.", "06 ม.ค.", "07 ม.ค."]);
  const [startDate, setStartDate] = useState("01-01-2024");
  const [endDate, setEndDate] = useState("07-01-2024");
  const [minMaxValues, setMinMaxValues] = useState({ min: 0.2, max: 1.0 });
  const [loading, setLoading] = useState(true);
  
  // Calculated chart data based on selected PM type
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: dateLabels,
    datasets: [
      {
        data: pmData["PM 0.1"],
        colors: Array(7).fill((opacity = 1) => `rgba(215, 255, 0, ${opacity})`) // Yellowish-green color
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
            // ดึงข้อมูลล่าสุดของแต่ละวัน
            const timeEntries = Object.keys(data[date]).sort();
            const latestEntry = timeEntries[timeEntries.length - 1]; // เอาข้อมูลล่าสุดของวัน
            
            if (data[date][latestEntry]?.Data) {
              const latestData = data[date][latestEntry].Data;
              pm01Values.push(parseFloat(latestData.PM0_1.toFixed(2)) || 0);
              pm25Values.push(parseFloat(latestData.PM2_5.toFixed(2)) || 0);
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
                colors: Array(dates.length).fill((opacity = 1) => `rgba(215, 255, 0, ${opacity})`)
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
          colors: Array(dateLabels.length).fill((opacity = 1) => `rgba(215, 255, 0, ${opacity})`)
        },
      ],
    });
  };

  const screenWidth = Dimensions.get("window").width - 40;

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
      
      <BarChart
        data={chartData}
        width={screenWidth}
        height={180}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#262b36",
          backgroundGradientFrom: "#262b36",
          backgroundGradientTo: "#262b36",
          decimalPlaces: 1,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.6,
          propsForHorizontalLabels: {
            fontSize: 9,
          },
          propsForVerticalLabels: {
            fontSize: 9,
          },
        }}
        style={{
          borderRadius: 8,
          paddingRight: 0,
        }}
        showValuesOnTopOfBars={false}
        fromZero
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withInnerLines={true}
        segments={5}
        horizontalLabelRotation={0}
      />
      
      <View style={styles.timeLabel}>
        <Text style={styles.timeLabelText}>{startDate}</Text>
        <Text style={styles.timeLabelTextRight}>{endDate}</Text>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: '#d7ff00'}]}></View>
          <Text style={styles.legendText}>Min {minMaxValues.min.toFixed(1)}</Text>
        </View>
        <View style={styles.legendItem}>
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
  
  // ข้อมูลเริ่มต้น (จะถูกอัปเดตเมื่อได้ข้อมูลจริง)
  const initialMeasurementData: Record<MeasurementTypesKey, number[]> = {
    "อุณหภูมิ": [25, 26, 27, 26, 25, 26, 25],
    "ความชื้น": [65, 70, 75, 68, 72, 70, 67]
  };
  
  const [measurementData, setMeasurementData] = useState(initialMeasurementData);
  const [dateLabels, setDateLabels] = useState<string[]>(["01 ม.ค.", "02 ม.ค.", "03 ม.ค.", "04 ม.ค.", "05 ม.ค.", "06 ม.ค.", "07 ม.ค."]);
  const [startDate, setStartDate] = useState("01-01-2024");
  const [endDate, setEndDate] = useState("07-01-2024");
  const [minMaxValues, setMinMaxValues] = useState({ min: 20, max: 35 });
  const [loading, setLoading] = useState(true);
  
  // Chart data state
  const [chartData, setChartData] = useState<ChartDataType>({
    labels: dateLabels,
    datasets: [
      {
        data: measurementData["อุณหภูมิ"],
        colors: Array(7).fill((opacity = 1) => `rgba(33, 150, 243, ${opacity})`) // Blue color
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
            // ดึงข้อมูลล่าสุดของแต่ละวัน
            const timeEntries = Object.keys(data[date]).sort();
            const latestEntry = timeEntries[timeEntries.length - 1]; // เอาข้อมูลล่าสุดของวัน
            
            if (data[date][latestEntry]?.Data) {
              const latestData = data[date][latestEntry].Data;
              tempValues.push(parseFloat(latestData.Temperature.toFixed(1)) || 0);
              humidityValues.push(parseFloat(latestData.Humidity.toFixed(1)) || 0);
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
                colors: Array(dates.length).fill(
                  selectedType === "อุณหภูมิ"
                    ? (opacity = 1) => `rgba(33, 150, 243, ${opacity})`
                    : (opacity = 1) => `rgba(0, 188, 212, ${opacity})`
                )
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
    
    // Different color for humidity vs temperature
    const color = type === "อุณหภูมิ" 
      ? (opacity = 1) => `rgba(33, 150, 243, ${opacity})` // Blue for temperature
      : (opacity = 1) => `rgba(0, 188, 212, ${opacity})`; // Cyan for humidity
    
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

  const screenWidth = Dimensions.get("window").width - 40;

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
      
      <BarChart
        data={chartData}
        width={screenWidth}
        height={180}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          backgroundColor: "#262b36",
          backgroundGradientFrom: "#262b36",
          backgroundGradientTo: "#262b36",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.6,
          propsForHorizontalLabels: {
            fontSize: 9,
          },
          propsForVerticalLabels: {
            fontSize: 9,
          },
        }}
        style={{
          borderRadius: 8,
          paddingRight: 0,
        }}
        showValuesOnTopOfBars={false}
        fromZero
        withHorizontalLabels={true}
        withVerticalLabels={true}
        withInnerLines={true}
        segments={5}
        horizontalLabelRotation={0}
      />
      
      <View style={styles.timeLabel}>
        <Text style={styles.timeLabelText}>{startDate}</Text>
        <Text style={styles.timeLabelTextRight}>{endDate}</Text>
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: selectedType === "อุณหภูมิ" ? '#4CAF50' : '#00BCD4'}]}></View>
          <Text style={styles.legendText}>Min {minMaxValues.min.toFixed(1)}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, {backgroundColor: selectedType === "อุณหภูมิ" ? '#2196F3' : '#006064'}]}></View>
          <Text style={styles.legendText}>Max {minMaxValues.max.toFixed(1)}</Text>
        </View>
      </View>
    </View>
  );
};

// Main StatsScreen Component
const StatsScreen: React.FC<StatsScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        
        <PMChart />
        <TemperatureChart />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1d24", // Dark background color
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  headerText: {
    fontSize: 22,
    color: "white",
    fontWeight: "normal",
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: "#262b36", // Dark chart background
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    minHeight: 250, // ความสูงขั้นต่ำเพื่อให้มีพื้นที่แสดง loading indicator
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  chartHeaderText: {
    fontSize: 16,
    color: "white",
    fontWeight: "normal",
  },
  dropdownButton: {
    backgroundColor: "#262b36",
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  dropdownButtonText: {
    color: "white",
    fontSize: 14,
  },
  dropdownMenu: {
    position: "absolute",
    right: 0,
    top: 35,
    backgroundColor: "#333",
    borderRadius: 8,
    width: 120,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#444",
  },
  dropdownItemSelected: {
    backgroundColor: "#444",
  },
  dropdownItemText: {
    color: "white",
    fontSize: 14,
  },
  timeLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  timeLabelText: {
    color: "#aaa",
    fontSize: 12,
  },
  timeLabelTextRight: {
    color: "#aaa",
    fontSize: 12,
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 20,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  legendText: {
    color: "white",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  loadingChartContainer: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingChartText: {
    color: "white",
    marginTop: 10,
    fontSize: 14,
  },
});

export default StatsScreen;