# Usar Node.js LTS como base
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json primeiro (para cache eficiente)
COPY package*.json ./

# Instalar dependências
RUN npm install -g expo-cli && npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Expor a porta padrão usada pelo Expo
EXPOSE 19006

# Comando para iniciar o servidor Expo
CMD ["npm", "start"]
