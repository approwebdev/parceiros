FROM node:18-alpine as builder

# Instalar dependências necessárias para o build
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar todos os arquivos primeiro
COPY . .

# Remover o script de postinstall temporariamente para evitar build automático
RUN if grep -q "postinstall" package.json; then \
    sed -i 's/"postinstall": "npm run build",/"_postinstall": "npm run build",/g' package.json; \
    fi

# Instalar todas as dependências (incluindo devDependencies)
RUN npm install

# Agora executar o build manualmente
RUN npm run build

# Limpar dependências de desenvolvimento após o build
RUN npm cache clean --force && \
    apk del python3 make g++

# Iniciar nova imagem para produção
FROM node:18-alpine

WORKDIR /app

# Copiar apenas os arquivos necessários da etapa de build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expor a porta
ENV PORT=3000
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 