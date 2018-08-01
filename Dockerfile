FROM node:latest

ARG PORT

RUN mkdir /app && \
    groupadd -r nodeapp && \
    useradd -r -g nodeapp nodeapp

WORKDIR /app

COPY ./app/ /app/

RUN npm install
RUN npm run build

EXPOSE $PORT
USER nodeapp
CMD ["npm", "start"]
