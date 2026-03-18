library(plumber)
library(BRVM)
library(jsonlite)

# ─── Utilitaire : convertit un data.frame en liste JSON-safe ────────────────
df_to_list <- function(df) {
  jsonlite::fromJSON(jsonlite::toJSON(df, na = "null", digits = 6))
}

# ─── Health ─────────────────────────────────────────────────────────────────

#* @apiTitle BRVM Data API
#* @apiDescription Données de marché BRVM via le package R BRVM (Sikafinance/Richbourse)

#* Health check
#* @get /health
function() {
  list(status = "ok", service = "r-brvm")
}

# ─── GET /tickers ────────────────────────────────────────────────────────────

#* Liste tous les tickers BRVM avec nom complet et secteur
#* @serializer json
#* @get /tickers
function(res) {
  tryCatch({
    data <- BRVM_ticker_desc()
    list(
      success = TRUE,
      data    = df_to_list(data),
      count   = nrow(data)
    )
  }, error = function(e) {
    res$status <- 500
    list(success = FALSE, error = conditionMessage(e), data = NULL)
  })
}

# ─── GET /cours/:ticker ──────────────────────────────────────────────────────

#* Cours journalier/hebdo/mensuel d'un ticker
#* @param ticker Symbole boursier BRVM (ex: SNTS, ETIT)
#* @param period Période : daily | weekly | monthly (défaut: daily)
#* @serializer json
#* @get /cours/<ticker>
function(ticker, period = "daily", res) {
  period_map <- c(daily = 0L, weekly = 1L, monthly = 2L)
  period_int <- period_map[period]
  if (is.na(period_int)) {
    res$status <- 400
    return(list(success = FALSE, error = "period invalide. Valeurs: daily, weekly, monthly", data = NULL))
  }

  tryCatch({
    data <- BRVM_get1(ticker, Period = period_int)
    list(
      success = TRUE,
      ticker  = toupper(ticker),
      period  = period,
      data    = df_to_list(data),
      count   = nrow(data)
    )
  }, error = function(e) {
    res$status <- 500
    list(success = FALSE, error = conditionMessage(e), data = NULL)
  })
}

# ─── GET /indices ────────────────────────────────────────────────────────────

#* Tous les indices BRVM (Composite, BRVM30, Prestige + sectoriels)
#* @serializer json
#* @get /indices
function(res) {
  tryCatch({
    data <- BRVM_index()
    list(
      success = TRUE,
      data    = df_to_list(data),
      count   = nrow(data)
    )
  }, error = function(e) {
    res$status <- 500
    list(success = FALSE, error = conditionMessage(e), data = NULL)
  })
}

# ─── GET /marche ─────────────────────────────────────────────────────────────

#* Vue globale du marché : top hausses, top baisses, capitalisation totale
#* @serializer json
#* @get /marche
function(res) {
  tryCatch({
    rank_data <- BRVM_rank()
    cap_data  <- BRVM_cap()
    list(
      success = TRUE,
      data = list(
        rank           = df_to_list(rank_data),
        capitalisation = df_to_list(cap_data)
      )
    )
  }, error = function(e) {
    res$status <- 500
    list(success = FALSE, error = conditionMessage(e), data = NULL)
  })
}

# ─── GET /societe/:ticker ────────────────────────────────────────────────────

#* Infos détaillées d'une société : beta, RSI, secteur, capitalisation, cours actuel
#* @param ticker Symbole boursier BRVM (ex: SNTS, ETIT)
#* @serializer json
#* @get /societe/<ticker>
function(ticker, res) {
  tryCatch({
    data <- BRVM_company_info(toupper(ticker))
    list(
      success = TRUE,
      ticker  = toupper(ticker),
      data    = df_to_list(data)
    )
  }, error = function(e) {
    res$status <- 500
    list(success = FALSE, error = conditionMessage(e), data = NULL)
  })
}
