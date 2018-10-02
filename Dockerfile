FROM node:latest

ARG PORT

RUN mkdir /app && \
    groupadd -r nodeapp && \
    useradd -r -m -d /app -g nodeapp nodeapp && \
    chown -R nodeapp:nodeapp /app

WORKDIR /app

COPY ./app/ /app/

USER nodeapp

RUN npm install && \
    npm run build

EXPOSE $PORT
CMD ["npm", "start"]
