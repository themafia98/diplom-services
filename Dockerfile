FROM nginx:alpine
LABEL author="Pavel Petrovich"
WORKDIR /usr/src/app

COPY ./server/build ./server/src
COPY nginx.conf /app/docker/nginx.conf

COPY package.json /usr/src/app
RUN npm install
COPY . /usr/src/app

ENV NODE_ENV production

EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]
