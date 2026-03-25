# Stage 1 — Build the React app
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Stage 1.5 — Run tests (CI/CD Pipeline)
RUN npm run test -- --run

# Stage 1.6 — Build application
RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]