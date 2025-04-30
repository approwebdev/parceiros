FROM node:18-alpine

# Instalar dependências necessárias para o build
RUN apk add --no-cache python3 make g++ git

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o resto dos arquivos
COPY . .

# Build da aplicação
RUN npm run build

# Limpar cache e remover dependências de desenvolvimento
RUN npm cache clean --force && \
    apk del python3 make g++ git

# Expor a porta
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 