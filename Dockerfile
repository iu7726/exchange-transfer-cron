FROM node:18
RUN mkdir -p /var/service/og-playground-gamepack
WORKDIR /var/service/og-playground-gamepack
COPY . .
RUN yarn global add pm2
RUN yarn
RUN yarn build

CMD ["pm2-runtime", "start", "ecosystem.config.js"]

# docker buildx build --platform linux/amd64 -t og-playground-gamepack:1.0.1 .
# docker tag og-playground-gamepack:1.0.1 474944200741.dkr.ecr.ap-southeast-1.amazonaws.com/og-playground-gamepack:1.0.1
# docker push 474944200741.dkr.ecr.ap-southeast-1.amazonaws.com/og-playground-gamepack:1.0.1

# docker buildx build --platform linux/amd64 -t og-playground-gamepack:1.0.1 . && docker tag og-playground-gamepack:1.0.1 474944200741.dkr.ecr.ap-southeast-1.amazonaws.com/og-playground-gamepack:1.0.1 && docker push 474944200741.dkr.ecr.ap-southeast-1.amazonaws.com/og-playground-gamepack:1.0.1