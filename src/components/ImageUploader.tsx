import React, { useRef } from "react";

interface ImageUploaderProps {
  images: File[];
  onChange: (files: File[]) => void;
  maxCount?: number;
  maxSizeMB?: number;
}

// 中文注释：多图上传组件，支持预览和删除
const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onChange,
  maxCount = 9,
  maxSizeMB = 5,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // 处理文件选择
  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const fileArr = Array.from(files);
    // 校验数量
    if (images.length + fileArr.length > maxCount) {
      alert(`最多只能上传${maxCount}张图片`);
      return;
    }
    // 校验格式和大小
    const validFiles = fileArr.filter((file) => {
      const isImage = /image\/(jpeg|png|webp|gif)/.test(file.type);
      const isSizeOk = file.size <= maxSizeMB * 1024 * 1024;
      if (!isImage) {
        alert("仅支持jpg/png/webp/gif格式图片");
        return false;
      }
      if (!isSizeOk) {
        alert(`单张图片不能超过${maxSizeMB}MB`);
        return false;
      }
      return true;
    });
    onChange([...images, ...validFiles]);
    // 重置input
    if (inputRef.current) inputRef.current.value = "";
  };

  // 删除图片
  const handleRemove = (idx: number) => {
    const newImages = images.slice();
    newImages.splice(idx, 1);
    onChange(newImages);
  };

  // 触发文件选择
  const handleClick = () => {
    if (images.length >= maxCount) return;
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 上传按钮和预览区 */}
      <div className="flex flex-row flex-wrap gap-3 items-center">
        {/* 上传按钮 */}
        <button
          type="button"
          className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 text-3xl focus:outline-none"
          onClick={handleClick}
          aria-label="上传图片"
          tabIndex={0}
          disabled={images.length >= maxCount}
        >
          +
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />
        {/* 预览图片 */}
        {images.map((file, idx) => {
          const url = URL.createObjectURL(file);
          return (
            <div
              key={idx}
              className="relative w-20 h-20 group border rounded-lg overflow-hidden"
            >
              <img
                src={url}
                alt={`预览图${idx + 1}`}
                className="object-cover w-full h-full"
              />
              {/* 删除按钮 */}
              <button
                type="button"
                className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemove(idx)}
                aria-label="删除图片"
                tabIndex={0}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      {/* 中文注释：图片数量提示 */}
      <div className="text-xs text-gray-500">
        {`已选${images.length}张，最多${maxCount}张，单张不超过${maxSizeMB}MB`}
      </div>
    </div>
  );
};

export default ImageUploader; 