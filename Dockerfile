FROM nginx:alpine
LABEL author="Pavel Petrovich"
COPY ./server/build ./server/src
COPY nginx.conf /app/nginx/nginx.conf
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]
