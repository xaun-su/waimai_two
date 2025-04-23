import { ReactNode } from 'react';
import './less/title.less';

// 定义 Props 类型
interface TitleProps {
  right?: ReactNode; // 可选，React 节点类型
  left?: ReactNode; // 可选，React 节点类型
}

// 使用显式类型定义函数组件
function Title({ right,left }: TitleProps) {
  return (
    <div className="title">
      <div className="left">
        {left}
      </div>
      <div className="right">
        {right}
      </div>
    </div>
  );
}

export default Title;