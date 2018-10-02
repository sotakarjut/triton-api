FROM node:latest

ARG PORT

RUN groupadd -r nodeapp && \
    useradd -r -m -d /app -g nodeapp nodeapp

COPY ./app/ /app/

RUN chown -R nodeapp:nodeapp /app

WORKDIR /app

USER nodeapp

RUN npm install && \
    npm run build

EXPOSE $PORT
CMD ["npm", "start"]
