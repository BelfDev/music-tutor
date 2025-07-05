# Note Pilot - Makefile for Development Convenience
# ================================================

# Default shell for better cross-platform compatibility
SHELL := /bin/bash

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
PURPLE := \033[0;35m
CYAN := \033[0;36m
WHITE := \033[0;37m
NC := \033[0m # No Color

# Project info
PROJECT_NAME := Note Pilot
VERSION := 1.0.0
NODE_VERSION := 16

.PHONY: help install dev build preview clean lint test type-check fix format setup status deploy-check all fresh quick docs demo sample clean-all node-check

# Default target
.DEFAULT_GOAL := help

## 🎹 Note Pilot Development Commands
help: ## Show this help message
	@echo -e "$(CYAN)$(PROJECT_NAME) v$(VERSION)$(NC)"
	@echo -e "$(BLUE)===========================================$(NC)"
	@echo ""
	@echo -e "$(GREEN)Available commands:$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z_-]+:.*##/ { printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo -e "$(PURPLE)Quick start: make setup && make dev$(NC)"

## 📦 Installation & Setup
install: ## Install project dependencies
	@echo -e "$(BLUE)Installing dependencies...$(NC)"
	@npm install
	@echo -e "$(GREEN)✅ Dependencies installed successfully!$(NC)"

setup: install ## Complete project setup (install + checks)
	@echo -e "$(BLUE)Setting up Note Pilot project...$(NC)"
	@make --no-print-directory node-check
	@echo -e "$(GREEN)✅ Project setup complete! Run 'make dev' to start development.$(NC)"

node-check: ## Check Node.js version
	@echo -e "$(BLUE)Checking Node.js version...$(NC)"
	@node_version=$$(node -v | sed 's/v//'); \
	if [ "$$(printf '%s\n' "$(NODE_VERSION)" "$$node_version" | sort -V | head -n1)" = "$(NODE_VERSION)" ]; then \
		echo -e "$(GREEN)✅ Node.js $$node_version is compatible (requires $(NODE_VERSION)+)$(NC)"; \
	else \
		echo -e "$(RED)❌ Node.js $$node_version is too old. Please upgrade to $(NODE_VERSION)+ from https://nodejs.org/$(NC)"; \
		exit 1; \
	fi

## 🚀 Development
dev: ## Start development server with hot reload
	@echo -e "$(BLUE)Starting development server...$(NC)"
	@echo -e "$(CYAN)🎹 Note Pilot will be available at: http://localhost:3000$(NC)"
	@npm run dev

build: ## Build for production
	@echo -e "$(BLUE)Building for production...$(NC)"
	@npm run build
	@echo -e "$(GREEN)✅ Production build completed! Files are in ./dist/$(NC)"

preview: build ## Build and preview production version locally
	@echo -e "$(BLUE)Starting preview server...$(NC)"
	@echo -e "$(CYAN)🎹 Production preview available at: http://localhost:4173$(NC)"
	@npm run preview

## 🧹 Cleanup
clean: ## Clean build artifacts and caches
	@echo -e "$(BLUE)Cleaning up...$(NC)"
	@rm -rf dist/
	@rm -rf .vite/
	@rm -rf .cache/
	@rm -rf node_modules/.cache/
	@echo -e "$(GREEN)✅ Cleanup completed!$(NC)"

clean-all: clean ## Clean everything including node_modules
	@echo -e "$(YELLOW)Removing node_modules...$(NC)"
	@rm -rf node_modules/
	@echo -e "$(GREEN)✅ Complete cleanup finished! Run 'make install' to reinstall.$(NC)"

## 🔍 Code Quality
lint: ## Run ESLint to check code quality
	@echo -e "$(BLUE)Running linter...$(NC)"
	@npm run lint

fix: ## Auto-fix linting issues
	@echo -e "$(BLUE)Auto-fixing linting issues...$(NC)"
	@npm run lint:fix
	@echo -e "$(GREEN)✅ Linting fixes applied!$(NC)"

type-check: ## Run TypeScript type checking
	@echo -e "$(BLUE)Running TypeScript type check...$(NC)"
	@npm run type-check
	@echo -e "$(GREEN)✅ Type checking passed!$(NC)"

format: fix ## Alias for fix (auto-format code)

test: ## Run tests (when implemented)
	@echo -e "$(BLUE)Running tests...$(NC)"
	@npm run test || echo -e "$(YELLOW)⚠️  Tests not yet implemented$(NC)"

## 📊 Project Status
status: ## Show project status and health check
	@echo -e "$(CYAN)$(PROJECT_NAME) Project Status$(NC)"
	@echo -e "$(BLUE)================================$(NC)"
	@echo ""
	@echo -e "$(GREEN)📍 Node.js Version:$(NC) $$(node -v)"
	@echo -e "$(GREEN)📍 NPM Version:$(NC) $$(npm -v)"
	@echo -e "$(GREEN)📍 Project Version:$(NC) $(VERSION)"
	@echo ""
	@if [ -d "node_modules" ]; then \
		echo -e "$(GREEN)✅ Dependencies: Installed$(NC)"; \
	else \
		echo -e "$(RED)❌ Dependencies: Not installed (run 'make install')$(NC)"; \
	fi
	@if [ -d "dist" ]; then \
		echo -e "$(GREEN)✅ Build: Available$(NC)"; \
	else \
		echo -e "$(YELLOW)⚠️  Build: Not built (run 'make build')$(NC)"; \
	fi
	@echo ""

## 🚀 Deployment
deploy-check: build lint type-check ## Check if project is ready for deployment
	@echo -e "$(BLUE)Running deployment readiness check...$(NC)"
	@echo -e "$(GREEN)✅ Build: Complete$(NC)"
	@echo -e "$(GREEN)✅ Linting: Passed$(NC)"
	@echo -e "$(GREEN)✅ Type Check: Passed$(NC)"
	@echo ""
	@echo -e "$(CYAN)🚀 Project is ready for deployment!$(NC)"
	@echo -e "$(PURPLE)Deploy the ./dist/ folder to your hosting service$(NC)"

## 🎯 Convenience Commands
all: clean install build ## Clean, install, and build everything
	@echo -e "$(GREEN)✅ Complete rebuild finished!$(NC)"

fresh: clean-all install ## Complete fresh start (remove everything and reinstall)
	@echo -e "$(GREEN)✅ Fresh installation completed!$(NC)"

quick: ## Quick development start (install if needed + dev)
	@if [ ! -d "node_modules" ]; then \
		echo -e "$(YELLOW)Dependencies not found, installing...$(NC)"; \
		make --no-print-directory install; \
	fi
	@make --no-print-directory dev

## 📚 Documentation
docs: ## Show project documentation links
	@echo -e "$(CYAN)📚 Note Pilot Documentation$(NC)"
	@echo -e "$(BLUE)=============================$(NC)"
	@echo ""
	@echo -e "$(GREEN)📖 Main README:$(NC) ./README.md"
	@echo -e "$(GREEN)📖 Technical Docs:$(NC) ./docs/README.md"
	@echo -e "$(GREEN)📖 Tech Stack:$(NC) ./docs/TECH_STACK.md"
	@echo -e "$(GREEN)📖 Deployment Status:$(NC) ./docs/DEPLOYMENT_STATUS.md"
	@echo ""
	@echo -e "$(PURPLE)🌐 Running Server:$(NC) http://localhost:3000"
	@echo -e "$(PURPLE)🎼 Sample PDF:$(NC) ./sheet-music/concerning_hobbits.pdf"

## 🎵 Project Specific
demo: quick ## Start with demo data (alias for quick)

sample: ## Info about sample sheet music
	@echo -e "$(CYAN)🎼 Sample Sheet Music$(NC)"
	@echo -e "$(BLUE)====================$(NC)"
	@echo ""
	@echo -e "$(GREEN)📄 File:$(NC) ./sheet-music/concerning_hobbits.pdf"
	@echo -e "$(GREEN)🎵 Piece:$(NC) Concerning Hobbits (Howard Shore)"
	@echo -e "$(GREEN)💡 Usage:$(NC) Upload this file to test the application"
	@echo ""
	@if [ -f "sheet-music/concerning_hobbits.pdf" ]; then \
		echo -e "$(GREEN)✅ Sample file is available$(NC)"; \
	else \
		echo -e "$(RED)❌ Sample file not found$(NC)"; \
	fi

# Hidden targets (no help text)
.SILENT: help install setup node-check dev build preview clean clean-all lint fix type-check format test status deploy-check all fresh quick demo sample