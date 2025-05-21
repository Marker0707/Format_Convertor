import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  return (
    <div className="container">
      <h1>Format Convertor</h1>
      <div className="steps">
        <p>STEP 1: 选择需要转换的文件</p>
        <p>STEP 2: 点击开始转换</p>
      </div>
      <p className="instruction2">
        请把Phenix数据库和操作系统语言改为中文！不支持英文系统！
      </p>
      <FileUpload />
      <div className="contributor-section">
        <h2>Contributor</h2>
        <p>Format Convertor来源于@唯唯🍪提供的python脚本（感谢！🙏），从一开始运行在命令行中的format transfer到拥有用户界面的format convertor APP，经历数次迭代后，Format Convertor现在可以在线使用！</p>
        <p>感谢门诊@胖子杰和各位同学对软件调试的贡献！</p>
        <p className="contact">📧 使用问题请联系 caijh09@gmail.com</p>
        <p className="contact">京ICP备2024077866号</p>
        <p className="wulab">© 2024 Wu lab</p>
      </div>
    </div>
  );
}

export default App;

