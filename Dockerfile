FROM sandrokeil/typescript as builder
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:12.22.1-alpine3.12
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/dist /app
ARG EXECUTABLE src/server.js
ENV EXECUTABLE ${EXECUTABLE}
EXPOSE 3000
CMD ["sh", "-c", "node /app/${EXECUTABLE}"]