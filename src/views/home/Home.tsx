// src/views/home/DemoLine.tsx
import React, { useState, useEffect } from 'react';
import { Line } from '@ant-design/charts';
import { getTotalData } from '../../api/home'; // 导入获取数据的函数
import { message } from 'antd'; // 引入 Ant Design 的 message 组件用于错误提示

// 定义图表数据点的类型，方便 TypeScript 类型检查
interface ChartDataItem {
  week: string; // x轴字段，对应后端返回的 date (周标签)
  value: number; // y轴字段，对应后端返回的 series.data 中的数值
  type: string; // 系列区分字段，对应后端返回的 series.type
}

const DemoLine: React.FC = () => {
  // data 状态将存储转换后符合 Ant Design Charts 格式的数据
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true); // 添加加载状态
  const [error, setError] = useState<string | null>(null); // 添加错误状态

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // 开始加载数据
        setError(null); // 清除之前的错误状态

        const response = await getTotalData();
        console.log('API Response Data in DemoLine:', response.data); // 打印响应体数据

        // 检查响应是否成功且包含嵌套的 data 字段
        if (response && response.data && response.data.data) {
          const apiData = response.data.data; // 获取嵌套的 data 对象

          // 检查关键数据数组是否存在且长度一致
          if (
            apiData.date &&
            Array.isArray(apiData.date) &&
            apiData.source &&
            Array.isArray(apiData.source) &&
            apiData.source.every(series => Array.isArray(series.data) && series.data.length === apiData.date.length) // 检查每个系列的data数组长度与date数组一致
          ) {
            // 进行数据转换
            const transformedData: ChartDataItem[] = [];
            const weeks = apiData.date; // 获取周标签数组
            const seriesList = apiData.source; // 获取系列数据数组

            // 遍历周标签（x轴）
            weeks.forEach((week, weekIndex) => {
              // 对于每一周，遍历所有系列
              seriesList.forEach(series => {
                // 添加数据点
                transformedData.push({
                  week: week, // 使用周标签作为 xField
                  value: series.data[weekIndex], // 使用对应周的数值作为 yField
                  type: series.type, // 使用系列类型作为 seriesField
                });
              });
            });

            setData(transformedData); // 更新状态为转换后的数据
            console.log('Transformed Data for Chart:', transformedData); // 打印转换后的数据

          } else {
            console.error('API返回的数据结构不符合预期:', apiData);
            const errorMessage = '获取报表数据失败：数据格式错误';
            message.error(errorMessage);
            setError(errorMessage); // 设置错误状态
          }
        } else {
          console.error('获取报表数据失败：响应体为空或无效');
          const errorMessage = '获取报表数据失败';
          message.error(errorMessage);
          setError(errorMessage); // 设置错误状态
        }
      } catch (err: any) {
        console.error('获取报表数据时发生错误:', err);
        const errorMessage = '获取报表数据时发生错误';
        message.error(errorMessage);
        setError(errorMessage); // 设置错误状态
      } finally {
        setLoading(false); // 数据加载完成或发生错误，结束加载状态
      }
    };

    fetchData(); // 调用异步函数开始获取数据

  }, []); // 空依赖数组，确保只在组件挂载时执行一次

  // Ant Design Charts 配置
  const config = {
    title: {
      visible: true,
      text: '数据统计', // 标题
      style: {
        fontSize: 16, // 根据图片调整标题样式
        fontWeight: 'bold',
      }
    },
    padding: 'auto',
    forceFit: true, // 强制适应容器宽度
    data, // 使用从接口获取并转换后设置到状态的数据
    xField: 'week', // 对应转换后数据中的周标签字段名
    yField: 'value', // 对应转换后数据中的数值字段名
    seriesField: 'type', // 对应转换后数据中的系列类型字段名
    xAxis: {
      // 使用 category 类型来显示周标签
      type: 'category',
      label: {
         // formatter: (text: string) => text, // 周标签不需要额外格式化
      },
      title: {
         visible: false, // 图片中X轴没有标题
      }
    },
    yAxis: {
      label: {
        formatter: (v: number) => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`), // 格式化 Y 轴数值
      },
      title: {
         visible: false, // 图片中Y轴没有标题
      }
    },
    legend: {
      position: 'top-right' as const, // 图例位置，根据图片调整
      // Ant Design Charts 会自动根据 seriesField 的不同值生成图例
    },
    smooth: true, // 使折线平滑
    point: { // 添加数据点标记
      visible: true,
      size: 4, // 点的大小
      shape: 'circle', // 点的形状
      style: {
        stroke: '#fff', // 点的边框颜色
        lineWidth: 1,
      },
    },
    // 根据图片调整四种系列的颜色
    color: ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C'], // 蓝色（订单）、绿色（销售额）、黄色（注册）、红色（管理）
    responsive: true,
    // 添加 Tooltip 配置以匹配图片样式
    tooltip: {
      visible: true, // 确保 Tooltip 可见
      shared: true, // 开启共享 Tooltip，显示同一 x 轴位置所有系列的数据
      showCrosshairs: true, // 显示垂直的十字准星线
      showMarkers: true, // 显示 Tooltip 上的数据点标记
      // Tooltip 标题，显示当前周
      title: (datum: any) => {
        // datum 在 shared 为 true 时是一个数组，取第一个元素的 week 即可
        return datum && datum.length > 0 ? datum[0].week : '';
      },
      // Tooltip 内容格式化，通常默认的格式已经符合图片样式（列表显示各系列名称和数值）
      // 如果需要自定义，可以使用 formatter 函数
      // formatter: (datum: any) => {
      //   return { name: datum.type, value: datum.value };
      // },
    },
    // 移除 Ant Design Charts 内置的 loading 和 empty 配置
    // 我们将在外部通过条件渲染控制显示内容
  };

  // 根据状态有条件地渲染内容
  return (
    <div>
      <h3>数据统计</h3>
      {loading ? (
        // 显示加载提示
        <div style={{ textAlign: 'center', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>加载中...</div>
      ) : error ? (
        // 显示错误信息
        <div style={{ color: 'red', textAlign: 'center', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>{error}</div>
      ) : data.length === 0 ? (
        // 显示无数据提示
        <div style={{ textAlign: 'center', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>暂无数据</div>
      ) : (
        // 数据加载成功且不为空，渲染图表
        <div style={{ height: '400px' }}> {/* 给图表容器一个高度 */}
           {/* 只有在非加载且无错误时才渲染图表 */}
           <Line {...config} /> {/* 渲染折线图 */}
        </div>
      )}
    </div>
  );
};

export default DemoLine;
