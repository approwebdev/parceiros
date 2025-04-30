FROM node:18-alpine as builder

# Instalar dependências necessárias para o build
RUN apk add --no-cache python3 make g++ git

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm install

# Copiar o resto dos arquivos
COPY . .

# Build da aplicação
RUN npm run build

# Iniciar nova imagem para produção
FROM node:18-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/vite.config.js ./

# Instalar apenas as dependências de produção
RUN npm ci --only=production

# Expor a porta
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 