import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const BackButton = () => {
  const navigate = useNavigate();

  const handleBackToChat = () => {
    navigate('/chat');
  };

  return (
    <div className="flex items-center mb-4">
      <button
        onClick={handleBackToChat}
        className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
        aria-label="返回聊天"
      >
        <FiArrowLeft className="w-5 h-5 mr-2" />
        <span>返回聊天</span>
      </button>
    </div>
  );
};

export default BackButton; 