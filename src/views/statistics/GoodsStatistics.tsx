import  { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import request from '../../utils/request'; // 确保路径正确
import './statistics.less'; // 创建一个 Home.css 文件

// 定义接口类型
interface GoodsStatisticsItem {
 name: string;
 type: string;
 stack: string;
 [key: string]: any; // 允许其他动态字段
}

interface GoodsStatisticsResponse {
 data: {
   date: string[];
   source: GoodsStatisticsItem[];
 };
}

const Home = () => {
 const chartRef = useRef<HTMLDivElement>(null);
 const [chartData, setChartData] = useState<GoodsStatisticsResponse | null>(null);

 // 表格
 const getGoodsStatisticsApi = async (): Promise<GoodsStatisticsResponse> => {
   try {
     const response = await request.get('/stats/goods');
     console.log(response);
     return response.data as GoodsStatisticsResponse;
   } catch (error) {
     console.error("Error fetching goods statistics:", error);
     return { data: { date: [], source: [] } } as GoodsStatisticsResponse; // 返回一个空对象，防止程序崩溃
   }
 };

 useEffect(() => {
   const fetchData = async () => {
     const res = await getGoodsStatisticsApi();
     setChartData(res);
   };

   fetchData();
 }, []);

 useEffect(() => {
   if (chartData && chartRef.current) {
     // 遍历数据并修改字段
     const processedSource = chartData.data.source.map((item: GoodsStatisticsItem) => ({
       ...item,
       name: item.type || '未知类型', // 防止 type 为空
       type: 'line',
       stack: 'Total',
     }));

     // 初始化图表
     const myChart = echarts.init(chartRef.current);

     const option = {
       title: {
         text: '数据统计',
       },
       tooltip: {
         trigger: 'axis',
       },
       legend: {
         data: processedSource.map(item => item.name), // 使用动态数据
       },
       grid: {
         left: '3%',
         right: '4%',
         bottom: '3%',
         containLabel: true,
       },
       toolbox: {
         feature: {
           saveAsImage: {},
         },
       },
       xAxis: {
         type: 'category',
         boundaryGap: false,
         data: chartData.data.date,
       },
       yAxis: {
         type: 'value',
       },
       series: processedSource,
     };

     option && myChart.setOption(option);

     // Cleanup function to dispose of the chart instance when the component unmounts
     return () => {
       myChart.dispose();
     };
   }
 }, [chartData]);

 return <div className="homeBox" ref={chartRef}></div>;
};

export default Home;
