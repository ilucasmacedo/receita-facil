# Script para configurar Git com a nova conta GitHub
# Conta: ilucasmacedo/receita-facil

Write-Host "Configurando Git para nova conta GitHub..." -ForegroundColor Green
Write-Host ""

# Verificar se Git está instalado
$gitPath = $null
$possiblePaths = @(
    "C:\Program Files\Git\bin\git.exe",
    "C:\Program Files (x86)\Git\bin\git.exe",
    "$env:LOCALAPPDATA\Programs\Git\bin\git.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $gitPath = $path
        $env:PATH += ";$(Split-Path $path)"
        Write-Host "Git encontrado em: $path" -ForegroundColor Green
        break
    }
}

if (-not $gitPath) {
    # Tentar encontrar Git no PATH
    try {
        $gitVersion = & git --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Git encontrado no PATH" -ForegroundColor Green
            $gitPath = "git"
        }
    } catch {
        Write-Host "Git nao encontrado!" -ForegroundColor Red
        Write-Host "Por favor, instale o Git de: https://git-scm.com/download/win" -ForegroundColor Yellow
        Write-Host "Ou adicione o Git ao PATH do sistema." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "Inicializando repositorio Git..." -ForegroundColor Cyan

# Inicializar repositório se não existir
if (-not (Test-Path ".git")) {
    & git init
    Write-Host "Repositorio inicializado" -ForegroundColor Green
} else {
    Write-Host "Repositorio Git ja existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "Configurando remote para nova conta..." -ForegroundColor Cyan

# Remover remote antigo se existir
$remoteExists = & git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Removendo remote antigo..." -ForegroundColor Yellow
    & git remote remove origin
}

# Adicionar novo remote
& git remote add origin https://github.com/ilucasmacedo/receita-facil.git
Write-Host "Remote configurado: https://github.com/ilucasmacedo/receita-facil.git" -ForegroundColor Green

Write-Host ""
Write-Host "Adicionando arquivos..." -ForegroundColor Cyan
& git add .

Write-Host ""
Write-Host "Fazendo commit..." -ForegroundColor Cyan
& git commit -m "feat: Receita Facil - Sistema completo de gestao de receitas e precificacao"

Write-Host ""
Write-Host "Configurando branch main..." -ForegroundColor Cyan
& git branch -M main

Write-Host ""
Write-Host "Configuracao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Para fazer push, execute:" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "Dica: Se pedir credenciais, use:" -ForegroundColor Cyan
Write-Host "   - Usuario: ilucasmacedo" -ForegroundColor White
Write-Host "   - Senha: Seu Personal Access Token do GitHub" -ForegroundColor White
Write-Host ""
