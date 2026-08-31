# Alpine's musl-libc DNS resolver has documented issues with Node's built-in
# fetch (undici) reaching some external HTTPS APIs, even when raw TLS/socket
# connections succeed fine. Debian-based "slim" images use glibc and don't
# have this problem.
FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
