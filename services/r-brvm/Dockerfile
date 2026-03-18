FROM rocker/r-ver:4.3

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY install_packages.R .
RUN Rscript install_packages.R

COPY plumber.R .

EXPOSE 8000

CMD ["Rscript", "-e", "pr <- plumber::plumb('/app/plumber.R'); pr$run(host='0.0.0.0', port=8000)"]
