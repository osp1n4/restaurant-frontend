# Dockerfile para el frontend
FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Comando para desarrollo (en producción usar npm run build)
CMD ["npm", "run", "dev", "--", "--host"]

