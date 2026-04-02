FROM nginx:1.27-alpine
ARG API_BASE=http://localhost:3000
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
RUN sed -i "s#__API_BASE__#${API_BASE}#g" /usr/share/nginx/html/index.html
EXPOSE 80
