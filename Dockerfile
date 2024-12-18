# Usa a imagem oficial do Apache
FROM httpd:latest

# Define o diretório de trabalho
WORKDIR /usr/local/apache2/htdocs/

# Copia todos os arquivos e pastas para o diretório do Apache
COPY . /usr/local/apache2/htdocs/

# Exposição da porta padrão do Apache
EXPOSE 80
