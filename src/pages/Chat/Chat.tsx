import React from 'react';

const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-screen w-screen ">
      <h2 className="text-2xl mb-4">聊天界面</h2>
      <div className="flex-grow border border-gray-300 p-4">
        {/* 聊天内容将放在这里 */}
        <p>这里是聊天内容...</p>
      </div>
      <input
        type="text"
        placeholder="输入消息..."
        className="input mb-2"
      />
      <button className="btn btn-primary">发送</button>
    </div>
  );
};

export default Chat; 