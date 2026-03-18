options(repos = c(CRAN = "https://cran.rstudio.com/"))

# Dépendances
install.packages(c("plumber", "jsonlite", "httr"), quiet = TRUE)

# Package BRVM — disponible directement sur CRAN
install.packages("BRVM", quiet = TRUE)

cat("✓ Tous les packages installés avec succès\n")
