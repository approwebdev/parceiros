FROM node:16 as builder

# Definir diretório de trabalho
WORKDIR /app

# Configurar ambiente
ENV NODE_ENV=development
ENV NPM_CONFIG_LOGLEVEL=error
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false

# Copiar apenas os arquivos de package.json primeiro
COPY package.json ./
COPY package-lock.json* ./

# Instalar dependências com --legacy-peer-deps e ignorando scripts
RUN npm install --legacy-peer-deps --no-optional --ignore-scripts

# Copiar o resto dos arquivos
COPY . .

# Build da aplicação
RUN npm run build

# Iniciar nova imagem para produção
FROM node:16-slim

WORKDIR /app

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# Definir variáveis de ambiente para produção
ENV NODE_ENV=production
ENV PORT=3000

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 