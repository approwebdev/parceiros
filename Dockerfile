FROM node:18 as builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas os arquivos de dependências primeiro
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies)
RUN npm install --legacy-peer-deps

# Copiar o resto dos arquivos
COPY . .

# Build da aplicação
RUN npm run build

# Iniciar nova imagem para produção
FROM node:18-slim

WORKDIR /app

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/vite.config.js ./

# Instalar apenas dependências de produção com flag para ignorar erros
RUN npm install --omit=dev --no-optional --no-audit

# Expor a porta
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 