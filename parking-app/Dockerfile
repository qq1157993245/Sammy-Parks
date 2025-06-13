FROM node:23-alpine
EXPOSE 3000 3050 3100 3150 5860 5861

WORKDIR /home/app

COPY package.json /home/app/
COPY package-lock.json /home/app/
COPY .env /home/app/

COPY Microservices/package.json /home/app/Microservices/
COPY Microservices/package-lock.json /home/app/Microservices/

COPY Microservices/auth/build/ /home/app/Microservices/auth/build/
COPY Microservices/auth/package.json /home/app/Microservices/auth/

COPY Microservices/permit/build/ /home/app/Microservices/permit/build/
COPY Microservices/permit/package.json /home/app/Microservices/permit/

COPY Microservices/ticket/build/ /home/app/Microservices/ticket/build/
COPY Microservices/ticket/package.json /home/app/Microservices/ticket/

COPY Microservices/vehicle/build/ /home/app/Microservices/vehicle/build/
COPY Microservices/vehicle/package.json /home/app/Microservices/vehicle/

COPY Microservices/stripe/build/ /home/app/Microservices/stripe/build/
COPY Microservices/stripe/package.json /home/app/Microservices/stripe/

COPY Apps/package.json /home/app/Apps/
COPY Apps/package-lock.json /home/app/Apps/
COPY Apps/public /home/app/Apps/

COPY Apps/driver/.next/ /home/app/Apps/driver/.next/
COPY Apps/driver/package.json /home/app/Apps/driver/
COPY Apps/driver/next.config.ts /home/app/Apps/driver/

COPY Apps/administration/.next/ /home/app/Apps/administration/.next/
COPY Apps/administration/package.json /home/app/Apps/administration/
COPY Apps/administration/next.config.ts /home/app/Apps/administration/
COPY Apps/administration/data /home/app/Apps/administration/data/

COPY Apps/enforcement/.next/ /home/app/Apps/enforcement/.next/
COPY Apps/enforcement/package.json /home/app/Apps/enforcement/
COPY Apps/enforcement/next.config.ts /home/app/Apps/enforcement/
COPY Apps/enforcement/data /home/app/Apps/enforcement/data/

COPY Apps/landing-page/.next/ /home/app/Apps/landing-page/.next/
COPY Apps/landing-page/package.json /home/app/Apps/landing-page/
COPY Apps/landing-page/next.config.ts /home/app/Apps/landing-page/
COPY Apps/landing-page/public /home/app/Apps/landing-page/public/

COPY Services/package.json /home/app/Services/
COPY Services/package-lock.json /home/app/Services/

COPY Services/police/build /home/app/Services/police/build/
COPY Services/police/package.json /home/app/Services/police/

COPY Services/registrar/build /home/app/Services/registrar/build/
COPY Services/registrar/package.json /home/app/Services/registrar/

RUN npm run cis

CMD [ "npm", "start"]
