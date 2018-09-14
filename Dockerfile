FROM node:latest

ARG PORT

RUN mkdir /app && \
    groupadd -r nodeapp && \
    useradd -r -g nodeapp nodeapp

WORKDIR /app

COPY ./app/ /app/

RUN npm install && \
    npm run build && \
    chown -R nodeapp:nodeapp /app

EXPOSE $PORT
USER nodeapp
CMD ["npm", "start"]
