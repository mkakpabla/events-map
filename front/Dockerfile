# Stage dev
FROM node:22-alpine AS dev

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "--port", "4173"]

# Stage prod
FROM dev AS prod

RUN npm run build

EXPOSE 4173

CMD ["npm", "run", "preview", "--", "--host", "--port", "4173"]
