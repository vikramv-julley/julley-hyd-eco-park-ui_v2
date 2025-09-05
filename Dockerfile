# build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# build for production
RUN npm run build -- --configuration production

# runtime stage
FROM nginx:stable-alpine
# remove default html
RUN rm -rf /usr/share/nginx/html/*
# copy built files from builder
COPY --from=builder /app/dist/julley-hyd-eco-park-ui_v2/browser /usr/share/nginx/html
# custom nginx conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
