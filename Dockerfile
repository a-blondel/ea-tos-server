FROM ghcr.io/a-blondel/node:0.10.33-jessie

WORKDIR /app

COPY package*.json ./

RUN npm install --production \
    && npm cache clean --force

COPY index.js .
COPY tosa.en.txt .
COPY ./nwc ./nwc

RUN mkdir certs

EXPOSE 80
EXPOSE 443

ENTRYPOINT ["npm", "run"]
CMD ["start-http"]