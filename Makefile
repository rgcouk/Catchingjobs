.PHONY: help dev build test test-e2e lint format clean seed db-push db-generate quality-check

# Default target
.DEFAULT_GOAL := help

help: ## Show this help message
	@echo "Catchingjobs - Available Make Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

dev: ## Start development server (Hono API & Vite frontend)
	npm run dev

build: ## Build frontend client and SSR bundles
	npm run build

test: ## Run unit and integration tests
	npm run test

test-e2e: ## Run Playwright end-to-end tests
	npm run test:e2e

lint: ## Run ESLint checks across workspaces
	npm run lint

format: ## Format code with Prettier
	npm run format

clean: ## Remove build outputs, logs, and temporary caches
	npm run clean
	rm -rf dist dist-server dist-ssr node_modules/.vite .turbo coverage .DS_Store
	@echo "Clean completed."

seed: ## Seed database with initial datasets
	npm run seed

db-generate: ## Generate Prisma client from apps/api/prisma/schema.prisma
	npx prisma generate --schema=apps/api/prisma/schema.prisma

db-push: ## Push Prisma schema changes to database
	npx prisma db push --schema=apps/api/prisma/schema.prisma

quality-check: ## Execute full pre-flight verification (format, lint, test, build)
	npm run quality-check
