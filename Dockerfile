FROM node:18-alpine AS base

RUN apk --no-cache add libaio libnsl libc6-compat curl && \
  cd /tmp && \
  curl -o instantclient-basiclite.zip https://download.oracle.com/otn_software/linux/instantclient/instantclient-basiclite-linuxx64.zip -SL && \
  unzip instantclient-basiclite.zip && \
  mv instantclient*/ /usr/lib/instantclient && \
  rm instantclient-basiclite.zip && \
  ln -s /usr/lib/instantclient/libclntsh.so.19.1 /usr/lib/libclntsh.so && \
  ln -s /usr/lib/instantclient/libocci.so.19.1 /usr/lib/libocci.so && \
  ln -s /usr/lib/instantclient/libociicus.so /usr/lib/libociicus.so && \
  ln -s /usr/lib/instantclient/libnnz19.so /usr/lib/libnnz19.so && \
  ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1 && \
  ln -s /lib/libc.so.6 /usr/lib/libresolv.so.2 && \
  ln -s /lib64/ld-linux-x86-64.so.2 /usr/lib/ld-linux-x86-64.so.2

ENV ORACLE_BASE /usr/lib/instantclient
ENV LD_LIBRARY_PATH /usr/lib/instantclient
ENV TNS_ADMIN /usr/lib/instantclient
ENV ORACLE_HOME /usr/lib/instantclient

ENV CHOKIDAR_USEPOLLING true
ENV SKIP_PREFLIGHT_CHECK=true
ENV DISABLE_ESLINT_PLUGIN=true


# Define o diretório de trabalho do aplicativo dentro do container
WORKDIR /app

# Copia o package.json e o package-lock.json para o container
COPY package*.json ./

# Instala as dependências do aplicativo
RUN npm install

# Copia o código fonte do aplicativo para o container
COPY . .

# Instale o Oracle Instant Client
#RUN apt-get update && apt-get install -y libaio1
#COPY ./instantclient_21_11 /opt/oracle/instantclient_21_11
#ENV LD_LIBRARY_PATH=/opt/oracle/instantclient_21_11:$LD_LIBRARY_PATH

# Expõe a porta 3000 do container
EXPOSE 5001

# Comando para iniciar o aplicativo
CMD [ "npm", "start" ]
