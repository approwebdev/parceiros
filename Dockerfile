FROM node:16 as builder

# Definir diretório de trabalho
WORKDIR /app

# Configurações do npm para tornar a instalação mais robusta
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retry-maxtimeout 600000 -g
RUN npm config set fetch-timeout 600000 -g

# Copiar apenas os arquivos de dependências primeiro
COPY package*.json ./

# Limpar cache e instalar dependências
RUN npm cache clean --force
RUN npm install --no-optional --verbose --force

# Copiar o resto dos arquivos
COPY . .

# Build da aplicação
RUN npm run build

# Iniciar nova imagem para produção
FROM node:16-slim

WORKDIR /app

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# Configurar npm
RUN npm config set registry https://registry.npmjs.org/
RUN npm config set fetch-retry-maxtimeout 600000 -g

# Instalar apenas dependências de produção
RUN npm install --production --force

# Expor a porta
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 