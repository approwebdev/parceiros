FROM node:18-alpine

# Instalar dependências necessárias para o build
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar todos os arquivos necessários para o build
COPY . .

# Instalar dependências
RUN npm install

# Build da aplicação
RUN npm run build

# Limpar cache e remover dependências de desenvolvimento
RUN npm cache clean --force && \
    apk del python3 make g++

# Expor a porta
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 