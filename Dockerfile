FROM node:8-stretch

RUN echo "bump 5"

RUN mkdir /code/

WORKDIR /code/

RUN apt-get update \
  && apt-get install -y vim

RUN npm install -g nodemon
RUN npm install

CMD ["node", "/code/extract_data.js"]
