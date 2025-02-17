# 使用一个基础镜像，这里选择 Nginx 作为 Web 服务器
FROM nginx:1.21-alpine

# 删除 Nginx 默认的配置文件
RUN rm /etc/nginx/conf.d/default.conf

# 将自定义的 Nginx 配置文件复制到容器中
COPY nginx.conf /etc/nginx/conf.d

# 将 Vite 构建生成的静态文件复制到 Nginx 的默认网站根目录
COPY dist /usr/share/nginx/html

# 暴露容器的 8099 端口
EXPOSE 8099

# 启动 Nginx 服务
CMD ["nginx", "-g", "daemon off;"]